#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:shaders/lib/time.glsl
#include grass:config/shadow
#include grass:config/sky

// highly dubious way of doing this but it seems to work
mat2 moonUvModifier(const in int phase) {
    return mat2(
        0.25, 0.5,
        phase * 0.25, step(4.0, float(phase)) * 0.5
    );
}

// originally from aerie shaders by ambrosia, licensed under MIT
// i don't know if the license still applies but i'll keep this here just in case
void drawSquare(const in sampler2D squareTexture, inout vec3 color, const in vec3 viewDir, in vec3 lightDir, const in bool isMoon) {
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
    lightDir = vec3(lightDir.x, lightDir.y * cosAngle + lightDir.z * sinAngle, -lightDir.y * sinAngle + lightDir.z * cosAngle);
    #endif

    vec3 right = normalize(vec3(lightDir.z, 0.0, -lightDir.x));
    right.xy = rotationMatrix * right.xy;
    vec3 up = normalize(cross(lightDir, right));

    // Raytrace the sun in the sky
    float t = -20.0 / dot(viewDir, lightDir);
    vec3 hitPoint = viewDir * t;
    vec3 diff = hitPoint - lightDir;
    vec2 uv = vec2(dot(diff, right), dot(diff, up));
    float distToCenter = max(abs(uv.x), abs(uv.y));

    float size = 6 * SUN_SIZE; // 6 is roughly accurate to the size of the regular sun

    if(isMoon) {
        // TODO: is this correct?
        size *= 0.75;
    }

    if(distToCenter > size || t > 0) return;

    // Adjust the uv coordinates to map the texture properly
    vec2 texcoord = uv / (size * 2) + 0.5;

    if(isMoon) {
        mat2 uvModifier = moonUvModifier(moonPhase());
        texcoord *= uvModifier[0];
        texcoord += uvModifier[1];
    }

    // Sample the texture
    color += texture(squareTexture, texcoord).rgb;
}

vec3 getSunVector() {
    return frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;
}

vec3 getMoonVector() {
    return frx_worldIsMoonlit == 0 ? -frx_skyLightVector : frx_skyLightVector;
}

vec3 getSunriseColor() {
    float time = frx_worldTime;
    #define isSunset (time >= SUNSET_START && time <= SUNSET_END)
    #define isSunrise (time >= (SUNRISE_START + 1) && time <= SUNRISE_END + 1)

    if (isSunset || isSunrise) {
        // see net.minecraft.client.renderer.DimensionSpecialEffects
        float i = (cos((time - 0.25) * TAU) + 0.5) * 0.5 + 0.5;
        return vec3(
            i * 0.3 + 0.7,
            i * i * 0.7 + 0.2,
            0.2
        );
    } else {
        return vec3(-1);
    }

    #undef isSunset
    #undef isSunrise
}