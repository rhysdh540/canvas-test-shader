#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/world.glsl

in vec4 shadowViewPos;

vec3 shadowDist(int cascade) {
    vec4 c = frx_shadowCenter(cascade);
    return abs((c.xyz - shadowViewPos.xyz) / c.w);
}

int selectShadowCascade() {
    vec3 d3 = shadowDist(3);
    if(all(lessThan(d3, vec3(1.0)))) {
        return 3;
    }

    vec3 d2 = shadowDist(2);
    if(all(lessThan(d2, vec3(1.0)))) {
        return 2;
    }

    vec3 d1 = shadowDist(1);
    if(all(lessThan(d1, vec3(1.0)))) {
        return 1;
    }

    return 0;
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

    // Blend with the sky light using a simple multiply
    frx_fragLight.y *= directSkyLight;
}