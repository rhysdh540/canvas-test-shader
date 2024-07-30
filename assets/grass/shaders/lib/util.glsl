#define IS_GUI frx_isGui && !frx_isHand

#include frex:shaders/lib/math.glsl

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    float e = 1e-10;
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

#ifdef FRAGMENT_SHADER
void fixFragNormal() {
    mat3 tbn = mat3(
        frx_vertexTangent.xyz,
        cross(frx_vertexTangent.xyz, frx_vertexNormal.xyz) * frx_vertexTangent.w,
        frx_vertexNormal.xyz
    );
    frx_fragNormal = tbn * frx_fragNormal;

    if(frx_isHand) {
        // Fix hand normals because they are in view space
        frx_fragNormal = frx_fragNormal * frx_normalModelMatrix;
    }
}
#endif