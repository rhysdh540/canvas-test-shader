#include grass:shaders/lib/header.glsl
#include canvas:shaders/pipeline/diffuse.glsl // shhh
#include grass:shaders/lib/util.glsl
#include grass:config/shadow

#ifdef SHADOW_MAP_PRESENT
#include grass:shaders/lib/shadows.frag
#endif

uniform sampler2D u_sky_color;
uniform sampler2D u_glint;

// In the case of multiple color attachments, you use different layout qualifiers.
layout(location = 0) out vec4 fragColor;

// The shadow light vector - right and up
const vec3 guiSkyLightVector = vec3(-0.2, 0.7, 1.0);
const vec3 hurtColor = vec3(0.7, 0.1, 0.1);

vec4 calculateColor() {
    #ifdef SHADOWS_ENABLED
    vec3 lightmap = shadowLightmap();
    #else
    vec3 lightmap = texture(frxs_lightmap, frx_fragLight.xy).rgb;
    #endif

    if(frx_fragEnableAo) {
        lightmap *= frx_fragLight.z;
    }

    // Apply diffuse lighting (again)
    if(frx_fragEnableDiffuse) {
        if(IS_GUI) {
            float ndotl = dot(frx_vertexNormal, guiSkyLightVector);
            ndotl = ndotl * 0.5 + 0.5; // remap to 0-1 and lighten a bit
            lightmap *= ndotl;
        } else {
            lightmap *= p_diffuse(frx_vertexNormal);
        }
    }

    // emmissive textures are always fully lit
    lightmap = mix(lightmap, vec3(1.0), frx_fragEmissive);

    // frx_fragColor refers to the Minecraft texture color,
    // already multiplied with the vertex color so we can use it just like this.
    vec4 color = frx_fragColor;
    color.rgb *= lightmap;
    return color;
}

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
    color.rgb = mix(color.rgb, vec3(1.0), frx_matFlash * 0.5);
}

void applyFog(inout vec4 color) {
    vec2 texcoord = gl_FragCoord.xy / frxu_size;
    vec3 fogColor = texture(u_sky_color, texcoord).rgb;
    float rainGradient = max(frx_rainGradient, frx_thunderGradient);
    float fogStart = mix(frx_fogStart, frx_fogStart * 0.5, rainGradient);

    float blockDistance = length(frx_vertex.xyz) - 1;
    float fogFactor = smoothstep(fogStart, frx_fogEnd - 0.5, blockDistance);

    color = mix(color, vec4(fogColor, 0.0), fogFactor);

    if(frx_fogEnd < blockDistance) {
        discard;
    }
}

void frx_pipelineFragment() {
    vec4 color = calculateColor();
    applySpecialEffects(color);
    if(!IS_GUI && frx_fogEnabled == 1) {
        applyFog(color);
    }

    fragColor = color;

    // Write position data to the depth attachment
    gl_FragDepth = gl_FragCoord.z;
}