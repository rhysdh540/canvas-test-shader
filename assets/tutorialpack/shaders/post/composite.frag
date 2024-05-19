#include tutorialpack:shaders/post/header.glsl
#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/fog.glsl

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

in vec2 texcoord; // texture uv coordinate input

layout(location = 0) out vec4 fragColor; // fragment color output

const int array_length = 6; // GLSL arrays must be fixed-length

int current_length = 0; // The actual length of array

vec4[array_length] color_values;
float[array_length] depth_values;

void insertionSort(vec4 color, float depth) {
    // Filter out fully transparent pixel
    if(color.a == 0.0) {
        return;
    }

    // Store the values at the next empty index
    color_values[current_length] = color;
    depth_values[current_length] = depth;

    // Store the index of the current item
    int current = current_length;
    // Store the index of the item before it
    int before = current_length - 1;

    // Increment the length of the array
    current_length++;

    // Loop while there is an item before the current one
    // and if that item, importantly, has a lower depth.
    while(current > 0 && depth_values[current] > depth_values[before]) {

        // Swap the current item with the item before it
        vec4 temp_color = color_values[current];
        float temp_depth = depth_values[current];

        color_values[current] = color_values[before];
        depth_values[current] = depth_values[before];

        color_values[before] = temp_color;
        depth_values[before] = temp_depth;

        // We move to lower index
        current--;
        before--;
    }
}

vec3 blend_colors(vec3 destination, vec4 source) {
    return source.rgb + destination * (1.0 - source.a);
}

void main() {
    vec4  main_color        = texture(u_main_color       , texcoord);
    float main_depth        = texture(u_main_depth       , texcoord).r;
    vec4  translucent_color = texture(u_translucent_color, texcoord);
    float translucent_depth = texture(u_translucent_depth, texcoord).r;
    vec4  entity_color      = texture(u_entity_color     , texcoord);
    float entity_depth      = texture(u_entity_depth     , texcoord).r;
    vec4  weather_color     = texture(u_weather_color    , texcoord);
    float weather_depth     = texture(u_weather_depth    , texcoord).r;
    vec4  clouds_color      = texture(u_clouds_color     , texcoord);
    float clouds_depth      = texture(u_clouds_depth     , texcoord).r;
    vec4  particles_color   = texture(u_particles_color  , texcoord);
    float particles_depth   = texture(u_particles_depth  , texcoord).r;

    // The solid layer is special. We don't want it to be
    // potentially rejected by the function.
    color_values[0] = main_color;
    depth_values[0] = main_depth;
    current_length = 1;

    insertionSort(translucent_color, translucent_depth);
    insertionSort(entity_color, entity_depth);
    insertionSort(weather_color, weather_depth);
    insertionSort(clouds_color, clouds_depth);
    insertionSort(particles_color, particles_depth);

    // Initialize color with the bottom layer
    vec3 composite = color_values[0].rgb;

    // Iterate through the array
    for(int i = 1; i < current_length; i++){
        // Accumulate blended color
        composite = blend_colors(composite, color_values[i]);
    }

    // Alpha is mostly ignored, but we will set it to one
    // Some post-effects may require the alpha to be set to other value
    // For instance, FXAA3 expects the alpha to contain the luminance of this color
    fragColor = vec4(composite, 1.0);
}