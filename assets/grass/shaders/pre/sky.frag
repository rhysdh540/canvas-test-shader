#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:shaders/lib/sky.glsl

layout(location = 0) out vec4 fragColor;

void main() {
    #ifndef CUSTOM_SKY
    return;
    #endif

    vec3 color = frx_vanillaClearColor;
    vec4 sunrise = getSunriseColor();

    vec3 viewDir = getViewDir();
    float sunAngle = (frx_worldTime) * TAU;

    float f = sin(sunAngle) > 0.0F ? 1.0F : -1.0F;
    float angle = dot(viewDir, vec3(f, 0.0F, 0.0F));

    if (angle > 0.0F) {
        if (sunrise != vec4(0.0F)) {
            color = mix(color, sunrise.rgb, angle);
        }
    }

    fragColor = vec4(color, 1.0F);
}