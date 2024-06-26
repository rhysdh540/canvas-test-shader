#include tutorialpack:shaders/lib/header.glsl
#include tutorialpack:config/shadow

uniform sampler2D u_sun_texture;

// from aerie shaders by ambrosia, somewhat modified
// licensed under MIT..? idk if it still counds given how much it's changed
void applyCustomSun(inout vec3 color, const in vec3 viewDir) {
    vec3 sunVector = frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;
    // Raytrace the sun in the sky
    vec3 sunPosition = sunVector * 1.0;
    vec3 normal = sunVector;

    // Rotate the square to match the sun's angle
    float angle = radians(SUNLIGHT_ANGLE);
    float cosAngle = cos(angle), sinAngle = sin(angle);
    mat2 rotationMatrix = mat2(
        cosAngle, -sinAngle,
        sinAngle, cosAngle
    );

    // Rotate right and up vectors
    vec3 right = normalize(vec3(normal.z, 0.0, -normal.x));
    right.xy = rotationMatrix * right.xy;
    vec3 up = normalize(cross(normal, right));

    float t = -20.0 / dot(viewDir, normal);
    vec3 hitPoint = viewDir * t;
    vec3 diff = hitPoint - sunPosition;
    vec2 uv = vec2(dot(diff, right), dot(diff, up));
    float distToCenter = max(abs(uv.x), abs(uv.y));

    float sunSize = 6;
    bool inSun = distToCenter < sunSize && t < 0;

    if(inSun) {
        // Adjust the uv coordinates to map the texture properly
        vec2 sunTextcoord = uv / (sunSize * 2) + 0.5;

        // Sample the texture
        vec3 sunColor = texture(u_sun_texture, sunTextcoord).rgb;
        vec3 invSunColor = vec3(1.0) - sunColor;
        float alpha = 1.0 - min(min(invSunColor.r, invSunColor.g), invSunColor.b);
        sunColor = vec3(1); // temporary
        color = mix(color, sunColor, alpha);
    }
}


vec3 customSky(const in vec3 viewDir) {
    //temp until i can scatter the atmosphere
    vec3 color = frx_fogColor.rgb;

    applyCustomSun(color, viewDir);

    return color;
}