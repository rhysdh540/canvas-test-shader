// https://github.com/ambrosia13/Aerie-Shaders/blob/main/assets/aerie/shaders/post/taa.frag
#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/spaces.glsl

uniform sampler2D u_color;
uniform sampler2D u_previous_frame;
uniform sampler2D u_depth;
uniform sampler2D u_hand_depth;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

// Neighborhood clipping from "Temporal Reprojection Anti-Aliasing in INSIDE"
// Code by Belmu#4066
// Slightly modified
vec3 clipAABB(vec3 prevColor, vec3 minColor, vec3 maxColor) {
    vec3 pClip = 0.5 * (maxColor + minColor); // Center
    vec3 eClip = 0.5 * (maxColor - minColor); // Size

    vec3 vClip  = prevColor - pClip;
    vec3 aUnit  = abs(vClip / eClip);
    float denom = max(aUnit.x, max(aUnit.y, aUnit.z));

    return denom > 1.0 ? pClip + vClip / denom : prevColor;
}

#define NEIGHBORHOOD_SIZE 1
vec3 neighbourhoodClipping(sampler2D currTex, vec3 prevColor) {
    vec3 minColor = vec3(1e5), maxColor = vec3(-1e5);

    for(int x = -NEIGHBORHOOD_SIZE; x <= NEIGHBORHOOD_SIZE; x++) {
        for(int y = -NEIGHBORHOOD_SIZE; y <= NEIGHBORHOOD_SIZE; y++) {
            vec3 color = texelFetch(currTex, ivec2(gl_FragCoord.xy) + ivec2(x, y), 0).rgb;

            minColor = min(minColor, color); maxColor = max(maxColor, color);
        }
    }
    return clipAABB(prevColor, minColor, maxColor);
}

// Blend factor referenced from BSL Shaders
float taaBlendFactor(in vec2 currentCoord, in vec2 previousCoord) {
    vec2 velocity = (currentCoord - previousCoord);

    float blendFactor = float(clamp(previousCoord, 0, 1) == previousCoord);
    blendFactor *= smoothstep(0.3, 0.0, length(velocity)) * 0.9;

    return blendFactor;
}

void main() {
    vec4 color = texture(u_color, texcoord);

    float depth = texture(u_depth, texcoord).r;
    float handDepth = texture(u_hand_depth, texcoord).r;

    vec3 viewPos = setupSceneSpacePos(texcoord, min(depth, handDepth));
    vec3 positionDifference = frx_cameraPos - frx_lastCameraPos;
    vec3 lastScreenPos = lastFrameSceneSpaceToScreenSpace(viewPos + positionDifference);

    vec4 previousColor = texture(u_previous_frame, lastScreenPos.xy);

    vec3 tempColor = neighbourhoodClipping(u_color, previousColor.rgb);

    #ifdef NO_CLIP
    color.rgb = mix(color.rgb, previousColor.rgb, 0.95);
    #else
    color.rgb = mix(color.rgb, tempColor, clamp(taaBlendFactor(texcoord, lastScreenPos.xy), 0 , 1));
    #endif

    fragColor = max(vec4(1.0 / 65536.0), color);
}