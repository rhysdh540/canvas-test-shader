#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:shaders/lib/sky.glsl

layout(location = 0) out vec4 fragColor;

in vec3 sunriseColor;

uniform sampler2D u_sun_texture;
uniform sampler2D u_moon_phases;

void main() {
    #ifdef CUSTOM_SKY
    fragColor = vec4(frx_vanillaClearColor, 1.0);

    if(sunriseColor != vec3(-1.0)) {
        applySunset(fragColor.rgb, sunriseColor);
    }

    vec3 viewDir = getViewDir();
    vec3 sunDirection = getSunVector();

    // NOTE: this deviates from vanilla in that fog will blend with the sun/moon
    // is this a good thing?
    // also seemingly draws through terrain while underwater...
    drawSquare(u_sun_texture, fragColor.rgb, viewDir, sunDirection, false);
    drawSquare(u_moon_phases, fragColor.rgb, viewDir, -sunDirection, true);

    #endif
}