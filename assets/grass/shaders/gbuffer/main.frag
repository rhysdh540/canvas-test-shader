#include grass:shaders/lib/header.glsl
#include canvas:shaders/pipeline/diffuse.glsl // shhh
#include grass:shaders/lib/util.glsl
#include grass:config/shadow
#include grass:config/sky

#ifdef SHADOW_MAP_PRESENT
#include grass:shaders/lib/shadows.frag
#endif

uniform sampler2D u_sky_color;
uniform sampler2D u_glint;

// In the case of multiple color attachments, you use different layout qualifiers.
layout(location = 0) out vec4 fragColor;

const vec3 hurtColor = vec3(0.7, 0.1, 0.1);

void applySpecialEffects(inout vec4 color) {
    if(frx_matGlint == 1) {
        // Sample the glint texture and animate it
        vec3 glint = texture(u_glint, fract(frx_normalizeMappedUV(frx_texcoord) * 0.5 + frx_renderSeconds * 0.1)).rgb;

        // Apply the glint to the color
        glint = pow(glint, vec3(4.0));
        color.rgb += glint;
    }
    // Apply hurt effect (decrease green and blue) if the material is specified to have hurt
    color.rgb = mix(color.rgb, hurtColor, frx_matHurt * 0.5);
    // Apply flash effect if the material is specified to be flashing
    color.rgb = mix(color.rgb, vec3(2.0), frx_matFlash * 0.5);
}

void applyFog(inout vec4 color) {
    vec2 texcoord = gl_FragCoord.xy / vec2(frx_viewWidth, frx_viewHeight);
    #ifdef CUSTOM_SKY
    vec3 fogColor = texture(u_sky_color, texcoord).rgb;
    #else
    vec3 fogColor = frx_fogColor.rgb;
    #endif
    float rainGradient = max(frx_smoothedRainGradient, frx_smoothedThunderGradient * 1.2);
    float fogStart = mix(frx_fogStart, frx_fogStart * 0.5, rainGradient);

    float blockDistance = length(frx_vertex.xyz) - 1;
    float fogFactor = smoothstep(fogStart, frx_fogEnd - 0.5, blockDistance);

    color = mix(color, vec4(fogColor, 0.0), fogFactor);

    if(frx_fogEnd < blockDistance) {
        discard;
    }
}

void frx_pipelineFragment() {
    mat3 tbn = mat3(
        frx_vertexTangent.xyz,
        cross(frx_vertexTangent.xyz, frx_vertexNormal.xyz) * frx_vertexTangent.w,
        frx_vertexNormal.xyz
    );
    frx_fragNormal = tbn * frx_fragNormal;

    if(frx_isHand) {
        // Fix hand normals because they are in view space
        frx_fragNormal = frx_fragNormal * frx_normalModelMatrix;
    }

    #ifdef SHADOWS_ENABLED
    vec3 lightmap;
    if(!(IS_GUI)) {
        lightmap = shadowLightmap();
    } else {
        lightmap = texture(frxs_lightmap, frx_fragLight.xy).rgb;
    }
    #else
    vec3 lightmap = texture(frxs_lightmap, frx_fragLight.xy).rgb;
    #endif

    if(frx_fragEnableAo) {
        lightmap *= frx_fragLight.z;
    }

    // Apply diffuse lighting (again)
    if(frx_fragEnableDiffuse) {
        lightmap *= p_diffuse(frx_fragNormal);
    }

    // emmissive textures are always fully lit
    lightmap = mix(lightmap, frx_emissiveColor.rgb, frx_fragEmissive);

    // frx_fragColor refers to the Minecraft texture color,
    // already multiplied with the vertex color so we can use it just like this.
    vec4 color = frx_fragColor;
    color.rgb *= lightmap;

    applySpecialEffects(color);
    if(!(IS_GUI) && frx_fogEnabled == 1) {
        applyFog(color);
    }

    fragColor = color;

    // Write position data to the depth attachment
    gl_FragDepth = gl_FragCoord.z;
}