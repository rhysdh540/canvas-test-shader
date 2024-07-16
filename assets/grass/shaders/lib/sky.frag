#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:config/shadow
#include grass:config/sky

uniform sampler2D u_sun_texture;

// originally from aerie shaders by ambrosia, licensed under MIT
// i don't know if the license still applies but i'll keep this here just in case
void applyCustomSun(inout vec3 color, const in vec3 viewDir, in vec3 sunVector) {
    // Rotate the square to make it more interesting
    // the higher the zenith angle, the more the sun will be rotated
    float angle = radians(SUNLIGHT_ANGLE);
    float cosAngle = cos(angle), sinAngle = sin(angle);
    mat2 rotationMatrix = mat2(
        cosAngle, (SUNLIGHT_ANGLE < 0 ? -sinAngle : sinAngle),
        (SUNLIGHT_ANGLE < 0 ? sinAngle : -sinAngle), cosAngle
    );

    #ifndef SHADOWS_ENABLED
    sunVector = vec3(sunVector.x, sunVector.y * cos(angle) + sunVector.z * sin(angle), -sunVector.y * sin(angle) + sunVector.z * cos(angle));
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

    float sunSize = 6 * SUN_SIZE;
    bool inSun = distToCenter < sunSize && t < 0;

    if(!inSun) return;
    // Adjust the uv coordinates to map the texture properly
    vec2 sunTextcoord = uv / (sunSize * 2) + 0.5;

    // Sample the texture
    vec3 sunColor = texture(u_sun_texture, sunTextcoord).rgb;
    float alpha = max(max(sunColor.r, sunColor.g), sunColor.b);

    // Lighten the sun color a bit, especially the transparent fake bloom
    sunColor = clamp(mix(sunColor * 2, sunColor * 10, 1.0 - alpha), 0.0, 1.0);

    // Finally apply the sun color to the sky
    color = mix(color, sunColor, alpha);
}

const float atmosphereRadius = 500; // in blocks

const int steps = 16;

vec2 raySphereIntersect(const in vec3 rayOrigin, const in vec3 rayDir, const in vec3 sphereCenter, const in float sphereRadius) {
    vec3 oc = rayOrigin - sphereCenter;
    float b = 2.0 * dot(rayDir, oc);
    float c = dot(oc, oc) - sphereRadius * sphereRadius;
    float discriminant = b * b - 4.0 * c;

    if (discriminant < 0.0) {
        return vec2(-1.0);
    }

    bool camInsideSphere = dot(oc, oc) < sphereRadius * sphereRadius;

    return vec2(
        camInsideSphere ? 0.0 : (-b - sqrt(discriminant)) / 2.0,
        (-b + sqrt(discriminant)) / 2.0
    );
}


void customSky(inout vec3 color, in float depth, in float depthBlocks, const in vec3 viewDir) {
    vec3 sunVector = frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;
    bool isSky = depth == 1.0;

    if(isSky) {
        color = vec3(0); // remove the original sky
    }

    vec2 intersect = raySphereIntersect(vec3(0.0, frx_cameraPos.y, 0.0), viewDir, vec3(0.0), atmosphereRadius);
    if(intersect.x >= 0.0) {
        intersect.y = min(intersect.y, depthBlocks);

        float rayLength = intersect.y - intersect.x;

        float strength = isSky ? 1.2 : 1.3;

        color += (pow(rayLength, strength) / atmosphereRadius) * ((frx_fogColor.rgb * 0.3) + vec3(0, 0, 0.2));
    }

    if(isSky) {
        //TODO: rotate the sun vector by the zenith angle when shadows are off
        applyCustomSun(color, viewDir, sunVector);
    }
}