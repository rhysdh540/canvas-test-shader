#include tutorialpack:shaders/lib/header.glsl

in vec4 shadowViewPos;

vec3 shadowDist(int cascade) {
    vec4 c = frx_shadowCenter(cascade);
    return abs((c.xyz - shadowViewPos.xyz) / c.w);
}

int selectShadowCascade() {
    int cascade = 3;
    while(cascade > 0) {
        if(all(lessThan(shadowDist(cascade), vec3(1.0)))) {
            return cascade;
        }

        cascade--;
    }

    return -1; // no shadow
}

void doShadowStuff() {
    // Obtain the cascade level
    int cascade = selectShadowCascade();

    // Obtain shadow-space position
    vec4 shadowPos = frx_shadowProjectionMatrix(cascade) * shadowViewPos;

    // Transform into texture coordinates
    vec3 shadowTexCoord = shadowPos.xyz * 0.5 + 0.5;

    // Sample the shadow map
    float directSkyLight = texture(frxs_shadowMap, vec4(shadowTexCoord.xy, cascade, shadowTexCoord.z));

    // Pad the value to prevent absolute darkness
    directSkyLight = 0.3 + 0.7 * directSkyLight;

    // Apply diffuse lighting to the block
    // the shadow map isn't perfect, this should fix any discrepancies
    if(frx_fragEnableDiffuse) {
        float ndotl = dot(frx_vertexNormal, frx_skyLightVector);
        directSkyLight *= step(0.0, ndotl);
    }

    float sunsetMultiplier = abs(frx_skyLightTransitionFactor - 0.5) * 2;
    frx_fragLight.y *= sunsetMultiplier * directSkyLight;
}