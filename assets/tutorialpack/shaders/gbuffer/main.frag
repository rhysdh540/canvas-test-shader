#include frex:shaders/api/material.glsl
#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/world.glsl
#include frex:shaders/api/sampler.glsl
#include frex:shaders/api/fog.glsl
#include canvas:shaders/pipeline/diffuse.glsl

uniform sampler2D u_glint;

in vec4 shadowViewPos;

// In the case of multiple color attachments, you use different layout qualifiers.
layout(location = 0) out vec4 fragColor;

// The shadow light vector - right and up
const vec3 guiSkyLightVector = vec3(-0.2, 0.7, 1.0);

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
    #ifdef SHADOW_MAP_PRESENT
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
    #endif

    bool isGui = frx_isGui && !frx_isHand;

    vec3 lightmap = texture(frxs_lightmap, frx_fragLight.xy).rgb;

    if(frx_fragEnableAo) {
        lightmap *= frx_fragLight.z;
    }

    // Apply diffuse lighting to the block
    if(frx_fragEnableDiffuse && !isGui) {
        lightmap *= p_diffuse(frx_vertexNormal);
    }

    // Apply lighting to blocks in guis
    if(frx_fragEnableDiffuse && isGui) {
        float ndotl = dot(frx_vertexNormal, guiSkyLightVector);
        ndotl = ndotl * 0.5 + 0.5; // remap to 0-1 and lighten a bit
        lightmap *= ndotl;
    }

    // emmissive textures are always fully lit
    lightmap = mix(lightmap, vec3(1.0), frx_fragEmissive);

    // frx_fragColor refers to the Minecraft texture color,
    // already multiplied with the vertex color so we can use it just like this.
    vec4 color = frx_fragColor;
    color.rgb *= lightmap;
    return color;
}

vec4 applySpecialEffects(vec4 color) {
    if(frx_matGlint == 1) {
        // Sample the glint texture and animate it
        vec3 glint = texture(u_glint, fract(frx_normalizeMappedUV(frx_texcoord) * 0.5 + frx_renderSeconds * 0.1)).rgb;

        // Apply the glint to the color
        glint = pow(glint, vec3(4.0));
        color.rgb += glint;
    }
    // Apply hurt effect (decrease green and blue) if the material is specified to have hurt
    if(frx_matHurt == 1) {
        color.gb *= 0.1;
    }
    // Apply flash effect if the material is specified to be flashing
    if(frx_matFlash == 1) {
        color.rgb = vec3(1.0);
    }

    return color;
}

vec4 applyFog(vec4 color) {
    vec3 fogColor = frx_fogColor.rgb;
    float rainGradient = max(frx_rainGradient, frx_thunderGradient);
    float fogStart = mix(frx_fogStart, frx_fogStart * 0.5, rainGradient);

    float blockDistance = length(frx_vertex.xyz);
    float fogFactor = smoothstep(fogStart, frx_fogEnd, blockDistance);

    return mix(color, vec4(fogColor, color.a), fogFactor);
}

void frx_pipelineFragment() {
    vec4 color = calculateColor();
    color = applySpecialEffects(color);
    if(!frx_isGui) {
        color = applyFog(color);
    }

    fragColor = color;

    // Write position data to the depth attachment
    gl_FragDepth = gl_FragCoord.z;
}