#include tutorialpack:shaders/post/header.glsl
#include frex:shaders/api/fragment.glsl
#include tutorialpack:shaders/lib/sort.glsl

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

vec3 blend_colors(vec3 destination, vec4 source) {
    return source.rgb + destination * (1.0 - source.a);
}

void main() {
    Pair main = Pair(texture(u_main_color, texcoord), texture(u_main_depth, texcoord).r);
    Pair translucent = Pair(texture(u_translucent_color, texcoord), texture(u_translucent_depth, texcoord).r);
    Pair entity = Pair(texture(u_entity_color, texcoord), texture(u_entity_depth, texcoord).r);
    Pair weather = Pair(texture(u_weather_color, texcoord), texture(u_weather_depth, texcoord).r);
    Pair clouds = Pair(texture(u_clouds_color, texcoord), texture(u_clouds_depth, texcoord).r);
    Pair particles = Pair(texture(u_particles_color, texcoord), texture(u_particles_depth, texcoord).r);

    // Sort the pairs by depth
    Pair pairs[6];
    pairs[0] = main; pairs[1] = translucent; pairs[2] = entity; pairs[3] = weather; pairs[4] = clouds; pairs[5] = particles;
    batcherSort6(pairs);

    vec3 composite = vec3(0.0);
    for (int i = 0; i < 6; i++) {
        Pair pair = pairs[i];
        composite = blend_colors(composite, pair.color);
    }

    // Alpha is mostly ignored, but we will set it to one
    // Some post-effects may require the alpha to be set to other value
    // For instance, FXAA3 expects the alpha to contain the luminance of this color
    fragColor = vec4(composite, 1.0);
}