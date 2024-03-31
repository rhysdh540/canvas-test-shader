#include frex:shaders/api/material.glsl
#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/world.glsl
#include frex:shaders/api/sampler.glsl

uniform sampler2D u_glint;

in vec4 shadowViewPos;

// In the case of multiple color attachments, you use different layout qualifiers.
layout(location = 0) out vec4 fragColor;

// The shadow light vector - left and up
const vec3 guiSkyLightVector = vec3(0.5, 1.0, 1.0);

// Helper function
vec3 shadowDist(int cascade) {
    vec4 c = frx_shadowCenter(cascade);
    return abs((c.xyz - shadowViewPos.xyz) / c.w);
}

// Function for obtaining the cascade level
int selectShadowCascade() {
    vec3 d3 = shadowDist(3);
    if (d3.x < 1.0 && d3.y < 1.0 && d3.z < 1.0) {
        return 3;
    }

    vec3 d2 = shadowDist(2);
    if (d2.x < 1.0 && d2.y < 1.0 && d2.z < 1.0) {
        return 2;
    }

    vec3 d1 = shadowDist(1);
    if (d1.x < 1.0 && d1.y < 1.0 && d1.z < 1.0) {
        return 1;
    }

    return 0;
}

vec4 calculateColor() {
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
        // point towards sky if in world, if in gui then point up
        float ndotl = dot(frx_vertexNormal.xyz, frx_skyLightVector);
        directSkyLight *= step(0.0, ndotl);
    }

    // Blend with the sky light using a simple multiply
    frx_fragLight.y *= directSkyLight;

    vec3 lightmap = texture(frxs_lightmap, frx_fragLight.xy).rgb;

    if(frx_fragEnableAo) {
        lightmap *= frx_fragLight.z;
    }

    // Apply lighting to blocks in guis
    if(frx_fragEnableDiffuse && frx_isGui) {
        float ndotl = dot(frx_vertexNormal.xyz, guiSkyLightVector);
        ndotl = ndotl * 0.5 + 0.5;
        lightmap *= ndotl;
    }

    lightmap = mix(lightmap, vec3(1.0), frx_fragEmissive);

    // frx_fragColor refers to the Minecraft texture color,
    // already multiplied with the vertex color so we can use it just like this.
    vec4 color = frx_fragColor;
    color.rgb *= lightmap;
    return color;
}

vec4 applyGlint(vec4 color) {
    // Sample the glint texture and animate it
    vec3 glint = texture(u_glint, fract(frx_normalizeMappedUV(frx_texcoord) * 0.5 + frx_renderSeconds * 0.1)).rgb;

    // Apply the glint to the color
    glint = pow(glint, vec3(4.0));
    color.rgb += glint;

    return color;
}

vec4 applySpecialEffects(vec4 color) {
    if(frx_matGlint == 1) {
        color = applyGlint(color);
    }
    // Apply hurt effect if the material is specified to have hurt
    if(frx_matHurt == 1) {
        color.gb *= 0.1;
    }
    // Apply flash effect if the material is specified to be flashing
    if(frx_matFlash == 1) {
        color.rgb = vec3(1.0);
    }

    return color;
}

void frx_pipelineFragment() {
    fragColor = applySpecialEffects(calculateColor());

    // Write position data to the depth attachment
    gl_FragDepth = gl_FragCoord.z;
}