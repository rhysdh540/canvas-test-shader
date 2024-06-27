#include grass:shaders/lib/header.glsl
#include grass:config/shadow
#include grass:config/sky
#include grass:shaders/lib/sky.frag
#include grass:shaders/lib/spaces.glsl

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

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

// Fabulous sorting algorithm by Ambrosia, slightly modified to be 1 function
// https://github.com/ambrosia13/Aerie-Shaders/blob/c01e69ac194a904ccd76c9f17810cb33241d7eb9/assets/aerie/shaders/post/fabulous/sort.frag#L24
// licensed under MIT
void addLayer(inout vec3 background, const in vec4 foreground, inout float backgroundDepth, const in float foregroundDepth) {
    float isBackgroundCloser = step(foregroundDepth, backgroundDepth);
    backgroundDepth = mix(backgroundDepth, min(foregroundDepth, backgroundDepth), isBackgroundCloser);

    background = mix(background, background * (1.0 - foreground.a) + foreground.rgb * foreground.a, isBackgroundCloser);
}

#define getColor(sampler) texture(sampler, texcoord)
#define getDepth(sampler) texture(sampler, texcoord).r

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

    vec3 composite = mainColor.rgb;
    float compositeDepth = mainDepth;

    #ifdef CUSTOM_SKY
    float depthBlocks = length(setupSceneSpacePos(texcoord, mainDepth));
    scatter(composite, compositeDepth, depthBlocks, getViewDir());
    #endif

    addLayer(composite, translucentColor, compositeDepth, translucentDepth);
    addLayer(composite, weatherColor, compositeDepth, weatherDepth);
    addLayer(composite, entityColor, compositeDepth, entityDepth);
    if(cloudsColor.r > 0.5) { // clouds are grayscale, so testing 1 channel is enough
        addLayer(composite, vec4(vec3(cloudsColor.r), cloudsColor.a), compositeDepth, cloudsDepth);
    }
    addLayer(composite, particlesColor, compositeDepth, particlesDepth);

    // Alpha is mostly ignored, but we will set it to one
    // Some post-effects may require the alpha to be set to other value
    // For instance, FXAA3 expects the alpha to contain the luminance of this color
    fragColor = vec4(composite, 1.0);
}