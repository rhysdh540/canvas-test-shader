#include grass:shaders/lib/header.glsl
#include grass:config/shadow
#include grass:config/sky

uniform sampler2D u_sun_texture;

// originally from aerie shaders by ambrosia, licensed under MIT
// i don't know if the license still applies but i'll this here just in case
void applyCustomSun(inout vec3 color, const in vec3 viewDir, const in vec3 sunVector) {
    // Rotate the square to make it more interesting
    // the higher the zenith angle, the more the sun will be rotated
    float angle = radians(SUNLIGHT_ANGLE);
    float cosAngle = cos(angle), sinAngle = sin(angle);
    mat2 rotationMatrix = mat2(
        cosAngle, -sinAngle,
        sinAngle, cosAngle
    );

    vec3 right = normalize(vec3(sunVector.z, 0.0, -sunVector.x));
    right.xy = rotationMatrix * right.xy;
    vec3 up = normalize(cross(sunVector, right));

    // Raytrace the sun in the sky
    float t = -20.0 / dot(viewDir, sunVector);
    vec3 hitPoint = viewDir * t;
    vec3 diff = hitPoint - sunVector;
    vec2 uv = vec2(dot(diff, right), dot(diff, up));
    float distToCenter = max(abs(uv.x), abs(uv.y));

    float sunSize = 6 * SUN_SIZE;
    bool inSun = distToCenter < sunSize && t < 0;

    if(!inSun) return;
    // Adjust the uv coordinates to map the texture properly
    vec2 sunTextcoord = uv / (sunSize * 2) + 0.5;

    // Sample the texture
    vec3 sunColor = texture(u_sun_texture, sunTextcoord).rgb;
    float alpha = max(max(sunColor.r, sunColor.g), sunColor.b);

    // Lighten the sun color a bit, especially the transparent fake bloom
    sunColor = clamp(mix(sunColor * 3, sunColor * 7, 1.0 - alpha), 0.0, 1.0);

    // Finally apply the sun color to the sky
    color = mix(color, sunColor, alpha);
}

void scatter(inout vec3 color, const in float depth, const in vec3 viewDir) {
    vec3 sunVector = frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;

    if(depth == 1.0) {
        color = vec3(0); // remove the original sky
    }



    if(depth == 1.0) {
        applyCustomSun(color, viewDir, sunVector);
    }
}