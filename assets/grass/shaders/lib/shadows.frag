#include grass:shaders/lib/header.glsl
#include grass:config/shadow

vec3 shadowDist(int cascade, vec4 pos) {
    vec4 c = frx_shadowCenter(cascade);
    return abs((c.xyz - pos.xyz) / c.w);
}

int selectShadowCascade(vec4 pos) {
    for (int cascade = 3; cascade > 0; cascade--) {
        if (all(lessThan(shadowDist(cascade, pos), vec3(1.0)))) {
            return cascade;
        }
    }
    return 0;
}

vec3 setupShadowPos(in vec3 sceneSpacePos, in vec3 bias, out int cascade) {
    vec4 shadowViewPos = frx_shadowViewMatrix * vec4(sceneSpacePos, 1.0);
    cascade = selectShadowCascade(shadowViewPos);

    shadowViewPos = frx_shadowViewMatrix * vec4(sceneSpacePos + bias * (1.5 + (3 - cascade)), 1.0);

    vec4 shadowClipPos = frx_shadowProjectionMatrix(cascade) * shadowViewPos;
    vec3 shadowScreenPos = (shadowClipPos.xyz / shadowClipPos.w) * 0.5 + 0.5;

    return shadowScreenPos;
}

float shadowTexture(vec2 pos, float threshold, int cascade) {
    #ifndef SMOOTH_SHADOWS
    return texture(frxs_shadowMap, vec4(pos, cascade, threshold));
    #else
    // from lomo by fewizz, licensed under CC0
    return 1.0 - float(texture(frxs_shadowMapTexture, vec3(pos, cascade)).r < threshold);
    #endif
}

vec2 diskSampling(float i, float n, float phi) {
    float theta = (i + phi) / n;
    float angle = theta * TAU * n * 1.618033988749894;
    return vec2(sin(angle), cos(angle)) * theta;
}

const float maxBrightness = 0.8;

// from aerie by ambrosia, licensed under MIT
// slightly modified
vec3 shadowLightmap() {
    int cascade = -1;

    vec3 shadowScreenPos = setupShadowPos(frx_vertex.xyz, frx_vertexNormal.xyz * (0.025), cascade);

    float shadowBlurAmount = mix(2.0, 5.0, float(frx_matDisableDiffuse));
    float shadow = 0.0;

    const int shadowSamples = SHADOW_SAMPLES;
    for(int i = 0; i < shadowSamples; i++) {
        vec2 offset = diskSampling(i, shadowSamples, 1.0);

        vec2 newScreenPos = shadowScreenPos.xy + offset * shadowBlurAmount / SHADOW_RESOLUTION;
        shadow += shadowTexture(newScreenPos, shadowScreenPos.z, cascade);
    }
    shadow /= shadowSamples;

    float NdotL = mix(clamp(dot(frx_fragNormal, frx_skyLightVector), 0, 1), 1.0, frx_matDisableDiffuse);

    vec3 skyLight = texture(frxs_lightmap, vec2(1.0 / 16.0, frx_fragLight.y)).rgb * 0.75;
    vec3 directLight = frx_skyLightAtmosphericColor * shadow * sqrt(frx_skyLightTransitionFactor) * NdotL;

    if(frx_worldIsMoonlit == 1) {
        directLight *= (1.0 - maxBrightness);
    } else {
        directLight *= 0.75;
    }

    vec3 blockLight = texture(frxs_lightmap, vec2(frx_fragLight.x, 1.0 / 16.0)).rgb;

    vec3 totalSkyLight = (skyLight + directLight);
    if(frx_worldIsMoonlit == 1) {
        totalSkyLight *= maxBrightness;
    } else {
        totalSkyLight *= frx_skyLightTransitionFactor * (1.0 - maxBrightness) + maxBrightness;
    }

    return max(totalSkyLight, blockLight);
}