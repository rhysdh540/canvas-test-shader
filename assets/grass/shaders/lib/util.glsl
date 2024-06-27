#define IS_GUI frx_isGui && !frx_isHand
#define K_RGB2HSV vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0)
#define K_HSV2RGB vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0)
#define epsilon 1e-10

#include frex:shaders/lib/math.glsl

vec3 rgb2hsv(vec3 c) {
    vec4 p = mix(vec4(c.bg, K_RGB2HSV.wz), vec4(c.gb, K_RGB2HSV.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + epsilon)), d / (q.x + epsilon), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + K_HSV2RGB.xyz) * 6.0 - K_HSV2RGB.www);
    return c.z * mix(K_HSV2RGB.xxx, clamp(p - K_HSV2RGB.xxx, 0.0, 1.0), c.y);
}

float luminance(vec3 color) {
    return dot(color, vec3(0.2125f, 0.7153f, 0.0721f));
}