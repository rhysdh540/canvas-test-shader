#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:config/shadow
#include grass:config/sky

// originally from aerie shaders by ambrosia, licensed under MIT
// i don't know if the license still applies but i'll keep this here just in case
void applyCustomSun(const in sampler2D sunTexture, inout vec3 color, const in vec3 viewDir, in vec3 sunVector) {
    // Rotate the square to make it more interesting
    // the higher the zenith angle, the more the sun will be rotated
    float angle = radians(SUNLIGHT_ANGLE);
    float cosAngle = cos(angle), sinAngle = sin(angle);
    mat2 rotationMatrix = mat2(
        cosAngle, (SUNLIGHT_ANGLE < 0 ? -sinAngle : sinAngle),
        (SUNLIGHT_ANGLE < 0 ? sinAngle : -sinAngle), cosAngle
    );

    #ifndef SHADOWS_ENABLED
    // if shadows are off, frx_skyLightVector isn't rotated
    // so we need to rotate it here
    sunVector = vec3(sunVector.x, sunVector.y * cosAngle + sunVector.z * sinAngle, -sunVector.y * sinAngle + sunVector.z * cosAngle);
    #endif

    vec3 right = normalize(vec3(sunVector.z, 0.0, -sunVector.x));
    right.xy = rotationMatrix * right.xy;
    vec3 up = normalize(cross(sunVector, right));

    // Raytrace the sun in the sky
    float t = -20.0 / dot(viewDir, sunVector);
    vec3 hitPoint = viewDir * t;
    vec3 diff = hitPoint - sunVector;
    vec2 uv = vec2(dot(diff, right), dot(diff, up));
    float distToCenter = max(abs(uv.x), abs(uv.y));

    float sunSize = 6 * SUN_SIZE; // 6 is roughly accurate to the size of the regular sun

    if(!(distToCenter < sunSize && t < 0)) return;
    // Adjust the uv coordinates to map the texture properly
    vec2 sunTextcoord = uv / (sunSize * 2) + 0.5;

    // Sample the texture
    vec3 sunColor = texture(sunTexture, sunTextcoord).rgb;
    float alpha = max(max(sunColor.r, sunColor.g), sunColor.b);

    // Lighten the sun color a bit, especially the transparent fake bloom
    sunColor = clamp(mix(sunColor * 2, sunColor * 10, 1.0 - alpha), 0.0, 1.0);

    // Finally apply the sun color to the sky
    color = mix(color, sunColor, alpha);
}

vec3 getSunVector() {
    return frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;
}

vec3 getMoonVector() {
    return frx_worldIsMoonlit == 0 ? -frx_skyLightVector : frx_skyLightVector;
}

// from net.minecraft.client.renderer.DimensionSpecialEffects
// slightly modified for glsl/frex + removing decompiler nonsense
// probably illegal
vec3 getSunriseColor() {
    float threshold = 0.4F;
    float time = cos((frx_worldTime - 0.25) * TAU);
    if (abs(time) <= threshold) {
        float i = (time + 0.5F) * 0.5F + 0.5F;
        return vec3(
            i * 0.3F + 0.7F,
            i * i * 0.7F + 0.2F,
            0.2F
        );
    } else {
        return vec3(-1.0);
    }
}