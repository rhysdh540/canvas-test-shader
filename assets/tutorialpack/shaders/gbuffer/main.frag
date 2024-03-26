#include frex:shaders/api/material.glsl
#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/world.glsl
#include frex:shaders/api/sampler.glsl

uniform sampler2D u_glint;

// In the case of multiple color attachments, you use different layout qualifiers.
layout(location = 0) out vec4 fragColor;

vec4 calculate_color() {
    // frx_fragColor refers to the Minecraft texture color,
    // already multiplied with the vertex color so we can use it just like this.
    vec4 color = frx_fragColor;
    vec3 lightmap = texture(frxs_lightmap, frx_fragLight.xy).rgb;

    if(frx_fragEnableAo) {
        lightmap *= frx_fragLight.z;
    }
    if(frx_fragEnableDiffuse) {
        float diffuseFactor = dot(frx_vertexNormal, vec3(0.0, 1.0, 0.0));
        diffuseFactor = diffuseFactor * 0.5 + 0.5;
        diffuseFactor = 0.3 + 0.7 * diffuseFactor;

        lightmap *= diffuseFactor;
    }

    lightmap = mix(lightmap, vec3(1.0), frx_fragEmissive);

    color.rgb *= lightmap;
    return color;
}

vec4 apply_glint(vec4 color) {
    // Sample the glint texture and animate it
    vec3 glint = texture(u_glint, fract(frx_normalizeMappedUV(frx_texcoord) * 0.5 + frx_renderSeconds * 0.1)).rgb;

    // Apply the glint to the color
    glint = pow(glint, vec3(4.0));
    color.rgb += glint;

    return color;
}

vec4 apply_special_effects(vec4 color) {
    if(frx_matGlint == 1) {
        color = apply_glint(color);
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
    vec4 color = calculate_color();

    color = apply_special_effects(color);

    // Write color data to the color attachment
    fragColor = color;

    // Write position data to the depth attachment
    gl_FragDepth = gl_FragCoord.z;
}