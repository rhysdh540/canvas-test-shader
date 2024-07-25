#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:shaders/lib/sky.glsl

layout(location = 0) out vec4 fragColor;

void main() {
    #ifdef CUSTOM_SKY
    fragColor = vec4(frx_vanillaClearColor, 1.0);

    vec3 viewDir = getViewDir();
    float time = frx_worldTime;

    vec3 sunriseColor = getSunriseColor();
    if(sunriseColor != vec3(-1.0)) {
        bool sunset = time >= 0.5 && time <= 0.75;

        float sunAngle = (time - 0.25) * TAU;
        vec3 sunDirection = vec3(
            cos(sunAngle),
            -sin(sunAngle),
            0.0
        );

        // Calculate the intensity of the sunrise color based on the view direction and sun direction
        float fadeFactor = dot(viewDir, sunset ? -sunDirection : sunDirection);

        if(fadeFactor < 0.0) {
            // Adjust the fadeFactor to be stronger at the horizon and diminish upwards
            float horizonFactor = clamp((viewDir.y + 1.0) * 0.5, 0.0, 1.0);

            float sunriseIntensity;
            if(sunset) {
                sunriseIntensity = smoothstep(12, 14, time * 24);
            } else {
                float fixedTime = time;
                if(time > 0.75) {
                    fixedTime = 1.0 - time;
                }
                sunriseIntensity = smoothstep(-2, 0, fixedTime * 24);
            }

            sunriseIntensity = 1.0 - abs(sunriseIntensity - 0.5);
            sunriseIntensity = sunriseIntensity * 0.5 + 0.5;

            float combinedFactor = -fadeFactor * horizonFactor * sunriseIntensity * 4 * SUNSET_INTENSITY;

            fragColor.rgb = mix(fragColor.rgb, sunriseColor, combinedFactor);
        }
    }

    #endif
}