#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/spaces.glsl
#include grass:shaders/lib/sky.glsl

layout(location = 0) out vec4 fragColor;

const float atmosphereRadius = 500.0;

void main() {
    vec3 viewDir = getViewDir();
    vec3 sunVector = getSunVector();
    vec3 color = vec3(0);

    vec2 intersect = raySphereIntersect(vec3(0.0, frx_cameraPos.y, 0.0), viewDir, vec3(0.0), atmosphereRadius);
    if(intersect.x >= 0.0) {
        float rayLength = intersect.y - intersect.x;
        color = (pow(rayLength, 1.2) / atmosphereRadius) * ((frx_fogColor.rgb * 0.3) + vec3(0, 0, 0.2));
    }

    fragColor = vec4(color, 1.0);
}