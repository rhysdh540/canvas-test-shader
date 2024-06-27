#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:config/post

// Contrast Adaptive Sharpening from vkBasalt, licensed under MIT
// https://github.com/DadSchoorse/vkBasalt/blob/master/src/shader/cas.frag.glsl

uniform sampler2D u_source;
in vec2 texcoord;
layout(location = 0) out vec4 fragColor;

const float sharpness = 0.1;

#define offsetTexture(x, y) textureLodOffset(u_source, texcoord, 0.0f, ivec2(x, y)).rgb

void main() {
    #ifndef SHARPENING_ENABLED
    fragColor = texture(u_source, texcoord);
    return;
    #endif
    // fetch a 3x3 neighborhood around the pixel 'e',
    //  a b c
    //  d(e)f
    //  g h i
    vec4 inputColor = textureLod(u_source, texcoord, 0.0f);
    float alpha = inputColor.a;

    vec3 a = offsetTexture(-1,-1), b = offsetTexture( 0,-1), c = offsetTexture( 1,-1);
    vec3 d = offsetTexture(-1, 0),    e = inputColor.rgb,    f = offsetTexture( 1, 0);
    vec3 g = offsetTexture(-1, 1), h = offsetTexture( 0, 1), i = offsetTexture( 1, 1);

    // Soft min and max.
    //  a b c             b
    //  d e f * 0.5  +  d e f * 0.5
    //  g h i             h
    // These are 2.0x bigger (factored out the extra multiply).

    vec3 minRGB  = min(min(min(d, e), min(f, b)), h);
    vec3 minRGB2 = min(min(min(minRGB, a), min(g, c)), i);
    minRGB += minRGB2;

    vec3 maxRGB  = max(max(max(d, e), max(f, b)), h);
    vec3 maxRGB2 = max(max(max(maxRGB, a), max(g, c)), i);
    maxRGB += maxRGB2;

    // Smooth minimum distance to signal limit divided by smooth max.

    vec3 rcpMxRGB = vec3(1) / maxRGB;
    vec3 ampRGB = clamp((min(minRGB, 2.0 - maxRGB) * rcpMxRGB), 0, 1);

    // Shaping amount of sharpening.
    ampRGB = inversesqrt(ampRGB);
    float peak = 8.0 - 3.0 * sharpness;
    vec3 wRGB = vec3(-1) / (ampRGB * peak);
    vec3 rcpWeightRGB = vec3(1) / (1.0 + 4.0 * wRGB);

    //                          0 w 0
    //  Filter shape:           w 1 w
    //                          0 w 0

    vec3 window = (b + d) + (f + h);
    vec3 outColor = clamp((window * wRGB + e) * rcpWeightRGB, 0, 1);

    fragColor = vec4(outColor, alpha);
}