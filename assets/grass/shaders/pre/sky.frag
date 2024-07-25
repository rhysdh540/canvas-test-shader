#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:shaders/lib/sky.glsl

layout(location = 0) out vec4 fragColor;

const float sunriseStart = 12.0 / 24.0;
const float sunriseEnd = 14.0 / 24.0;

void main() {
    #ifndef CUSTOM_SKY
    return;
    #endif

    vec3 color = frx_vanillaClearColor;

    vec3 viewDir = getViewDir();
    float time = (frx_worldTime - 0.25);

    vec4 sunriseColor = getSunriseColor();
    // make the sunrise more intense at time = 13/24, and less intense at time = 12/24 and 14/24
    if(sunriseColor != vec4(0.0)) {
        float sunriseIntensity = smoothstep(sunriseStart, sunriseEnd, time);

        // make sunriseIntensity peak in the middle
        sunriseIntensity = 1.0 - abs(sunriseIntensity - 0.5) * 10.0;

        float sunAngle = time * TAU;
        vec3 sunDirection = vec3(-cos(sunAngle), sin(sunAngle), 0.0);

        // Calculate the intensity of the sunrise color based on the view direction and sun direction
        float fadeFactor = dot(viewDir, sunDirection);

        if(fadeFactor < 0.0) {
            // Adjust the fadeFactor to be stronger at the horizon and diminish upwards
            float horizonFactor = clamp((viewDir.y + 1.0) * 0.5, 0.0, 1.0);

            float combinedFactor = sunriseIntensity * fadeFactor * horizonFactor;

            color = mix(color, sunriseColor.rgb, combinedFactor);
        }
    }

    fragColor = vec4(color, 1.0);
}