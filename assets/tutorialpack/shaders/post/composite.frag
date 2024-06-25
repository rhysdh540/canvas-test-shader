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
uniform sampler2D u_particles_depth;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

// Fabulous sorting algorithm by Ambrosia
// https://github.com/ambrosia13/Aerie-Shaders/blob/c01e69ac194a904ccd76c9f17810cb33241d7eb9/assets/aerie/shaders/post/fabulous/sort.frag#L24
// licensed under MIT
void insert_layer(inout vec3 background, const in vec4 foreground, inout float backgroundDepth, const in float foregroundDepth) {
    float isBackgroundCloser = step(foregroundDepth, backgroundDepth);
    backgroundDepth = mix(backgroundDepth, min(foregroundDepth, backgroundDepth), isBackgroundCloser);

    background = mix(background, background * (1.0 - foreground.a) + foreground.rgb * foreground.a, isBackgroundCloser);
}

#define get_color(sampler) texture(sampler, texcoord)
#define get_depth(sampler) texture(sampler, texcoord).r

void main() {
    vec4 main_color = get_color(u_main_color);
    float main_depth = get_depth(u_main_depth);

    vec4 translucent_color = get_color(u_translucent_color);
    float translucent_depth = get_depth(u_translucent_depth);

    vec4 entity_color = get_color(u_entity_color);
    float entity_depth = get_depth(u_entity_depth);

    vec4 weather_color = get_color(u_weather_color);
    float weather_depth = get_depth(u_weather_depth);

    vec4 clouds_color = get_color(u_clouds_color);
    float clouds_depth = get_depth(u_clouds_depth);

    vec4 particles_color = get_color(u_particles_color);
    float particles_depth = get_depth(u_particles_depth);

    vec3 composite = main_color.rgb;
    float compositeDepth = main_depth;

    insert_layer(composite, translucent_color, compositeDepth, translucent_depth);
    insert_layer(composite, weather_color, compositeDepth, weather_depth);
    insert_layer(composite, entity_color, compositeDepth, entity_depth);
    insert_layer(composite, clouds_color, compositeDepth, clouds_depth);
    insert_layer(composite, particles_color, compositeDepth, particles_depth);

    // Alpha is mostly ignored, but we will set it to one
    // Some post-effects may require the alpha to be set to other value
    // For instance, FXAA3 expects the alpha to contain the luminance of this color
    fragColor = vec4(composite, 1.0);
}