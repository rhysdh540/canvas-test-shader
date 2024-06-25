#include tutorialpack:shaders/lib/header.glsl

uniform sampler2D u_main_color;
uniform sampler2D u_main_depth;
uniform sampler2D u_translucent_color;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_entity_color;
uniform sampler2D u_entity_depth;
uniform sampler2D u_weather_color;
uniform sampler2D u_weather_depth;
uniform sampler2D u_clouds_color;
uniform sampler2D u_clouds_depth;
uniform sampler2D u_particles_color;
uniform sampler2D u_particles_depth; // 12 samplers (don't go above 16!)

uniform sampler2D u_sun_texture;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

// Fabulous sorting algorithm by Ambrosia, slightly modified
// https://github.com/ambrosia13/Aerie-Shaders/blob/c01e69ac194a904ccd76c9f17810cb33241d7eb9/assets/aerie/shaders/post/fabulous/sort.frag#L24
// licensed under MIT
void addLayer(inout vec3 background, const in vec4 foreground, inout float backgroundDepth, const in float foregroundDepth) {
    float isBackgroundCloser = step(foregroundDepth, backgroundDepth);
    backgroundDepth = mix(backgroundDepth, min(foregroundDepth, backgroundDepth), isBackgroundCloser);

    background = mix(background, background * (1.0 - foreground.a) + foreground.rgb * foreground.a, isBackgroundCloser);
}

#define getColor(sampler) texture(sampler, texcoord)
#define getDepth(sampler) texture(sampler, texcoord).r

vec3 getViewDir() {
    vec3 screenSpacePos = vec3(texcoord, 1.0);
    vec3 clipSpacePos = screenSpacePos * 2.0 - 1.0;
    vec4 temp = frx_inverseViewProjectionMatrix * vec4(clipSpacePos, 1.0);
    return normalize(temp.xyz / temp.w);
}

void main() {
    vec4 mainColor = getColor(u_main_color);
    float mainDepth = getDepth(u_main_depth);

    vec4 translucentColor = getColor(u_translucent_color);
    float translucentDepth = getDepth(u_translucent_depth);

    vec4 entityColor = getColor(u_entity_color);
    float entityDepth = getDepth(u_entity_depth);

    vec4 weatherColor = getColor(u_weather_color);
    float weatherDepth = getDepth(u_weather_depth);

    vec4 cloudsColor = getColor(u_clouds_color);
    float cloudsDepth = getDepth(u_clouds_depth);

    vec4 particlesColor = getColor(u_particles_color);
    float particlesDepth = getDepth(u_particles_depth);

    // from aerie shaders by ambrosia, somewhat modified
    // licensed under MIT..? idk
    if(mainDepth == 1.0) {
        // This fragment is part of the sky
        vec3 viewDir = getViewDir();
        mainColor.rgb = pow(mainColor.rgb, vec3(1.2));

        if(frx_worldIsOverworld == 1) {
            vec3 sunVector = frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;
            // Raytrace the sun in the sky
            vec3 sunPosition = sunVector * 1.0;

            vec3 normal = sunVector;
            vec3 right = normalize(vec3(normal.z, 0.0, -normal.x));
            vec3 up = normalize(cross(normal, right));

            float time = -20.0 / dot(viewDir, normal);
            vec3 hitPoint = viewDir * time;
            vec3 diff = hitPoint - sunPosition;
            vec2 uv = vec2(dot(diff, right), dot(diff, up));
            float distToCenter = max(abs(uv.x), abs(uv.y));

            bool sun = distToCenter < 6 && time < 0;

            if(sun) {
                // this fragment is in the sun
                int sunTextureSize = 32;
                vec2 sunTextcoord = vec2(
//                    0 // wip - get coordinates of this fragment inside of the sun
                    mix(0, 32, uv.x), mix(0, 32, uv.y)
                );
//                mainColor.rgb = texture(u_sun_texture, sunTextcoord).rgb;
            } else {
                // also temporary
//                mainColor.rgb = vec3(87, 155, 255) / 255;
            }
        }
    }

    vec3 composite = mainColor.rgb;
    float compositeDepth = mainDepth;

    addLayer(composite, translucentColor, compositeDepth, translucentDepth);
    addLayer(composite, weatherColor, compositeDepth, weatherDepth);
    addLayer(composite, entityColor, compositeDepth, entityDepth);
//    addLayer(composite, cloudsColor, compositeDepth, cloudsDepth);
    addLayer(composite, particlesColor, compositeDepth, particlesDepth);

    // Alpha is mostly ignored, but we will set it to one
    // Some post-effects may require the alpha to be set to other value
    // For instance, FXAA3 expects the alpha to contain the luminance of this color
    fragColor = vec4(composite, 1.0);
}