#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:config/shadow
#include grass:config/sky

uniform sampler2D u_sun_texture;

// originally from aerie shaders by ambrosia, licensed under MIT
// i don't know if the license still applies but i'll this here just in case
// TODO also this doesn't actually rotate it correctly
// and it doesn't rotate at all when shadows are off (will have to rotate sunVector as well)
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
    sunColor = clamp(mix(sunColor * 2, sunColor * 10, 1.0 - alpha), 0.0, 1.0);

    // Finally apply the sun color to the sky
    color = mix(color, sunColor, alpha);
}

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

#define MAIN_STEPS 10
#define LIGHT_STEPS 10

const float atmosphereRadius = 100.0; // in blocks
const float densityFalloff = 1.0;

float densityAtPoint(const in vec3 point) {
    float height01 = (length(point)) / atmosphereRadius;
    return exp(-height01 * densityFalloff) * (1.0 - height01);
}

float opticalDepth(const in vec3 point, const in vec3 rayDir, const in float rayLength) {
    float stepSize = rayLength / float(LIGHT_STEPS - 1);
    vec3 samplePoint = point;
    float opticalDepth = 0.0;

    for (int i = 0; i < LIGHT_STEPS; i++) {
        float density = densityAtPoint(samplePoint);
        opticalDepth += density * stepSize;
        samplePoint += rayDir * stepSize;
    }

    return opticalDepth;
}

float calculateLight(const in vec3 cameraPos, const in vec2 intersect, const in vec3 viewDir, const in vec3 sunDir) {
    if(intersect.x < 0.0) {
        return 0.0;
    }

    float rayLength = intersect.y - intersect.x;

    float stepSize = rayLength / float(MAIN_STEPS - 1);
    vec3 point = cameraPos + viewDir * intersect.x;
    float light = 0;

    for (int i = 0; i < MAIN_STEPS; i++) {
        // first get the distance from the current point to the edge of the atmosphere
        float sunRayLength = raySphereIntersect(point, sunDir, vec3(0.0), atmosphereRadius).y;
        float sunRayOpticalDepth = opticalDepth(point, sunDir, sunRayLength);
        float viewRayOpticalDepth = opticalDepth(point, -viewDir, stepSize * i);

        float transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth));
        float localDensity = densityAtPoint(point);

        light += localDensity * transmittance * stepSize;

        point += viewDir * stepSize;
    }

    return light;
}

void customSky(inout vec3 color, in float depth, in float depthBlocks, const in vec3 viewDir) {
    vec3 sunVector = frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;
    bool isSky = depth == 1.0;

    if(isSky) {
        color = vec3(0); // remove the original sky
    }

    vec3 cameraPos = vec3(0.0, frx_cameraPos.y, 0.0);

    vec2 intersect = raySphereIntersect(cameraPos, viewDir, vec3(0.0), atmosphereRadius);
    intersect.y = min(intersect.y, depthBlocks);

    // cool funny rainbow atmosphere
    float light = calculateLight(cameraPos, intersect, viewDir, sunVector);
    color = color * (1.0 - light) + light;

    if(isSky) {
        applyCustomSun(color, viewDir, sunVector);
    }
}