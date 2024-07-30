#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/aa/fxaa.glsl
#include grass:config/post

uniform sampler2D u_source;
in vec2 texcoord;
layout(location = 0) out vec4 fragColor;

vec4 fxaa(sampler2D imag, vec2 texcoord) {
    vec2 inverseResolution = 1.0 / vec2(frxu_size);
    vec4 frag = texture(imag, texcoord);

    float lumaNW = frx_luminance(texture(imag, texcoord + vec2(-1.0, -1.0) * inverseResolution).rgb);
    float lumaNE = frx_luminance(texture(imag, texcoord + vec2(1.0, -1.0) * inverseResolution).rgb);
    float lumaSW = frx_luminance(texture(imag, texcoord + vec2(-1.0, 1.0) * inverseResolution).rgb);
    float lumaSE = frx_luminance(texture(imag, texcoord + vec2(1.0, 1.0) * inverseResolution).rgb);
    float lumaM  = frx_luminance(frag.rgb);

    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * (1.0 / 8.0)), 1.0 / 128.0);
    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(8.0, 8.0), max(vec2(-8.0, -8.0), dir * rcpDirMin)) * inverseResolution;

    vec3 rgbA = 0.5 * (texture(imag, texcoord + dir * (1.0 / 3.0 - 0.5)).rgb +
    texture(imag, texcoord + dir * (2.0 / 3.0 - 0.5)).rgb);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (texture(imag, texcoord + dir * 0.5).rgb +
    texture(imag, texcoord - dir * 0.5).rgb);

    float lumaB = frx_luminance(rgbB);
    if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
        return vec4(rgbA, frag.a);
    }
    return vec4(rgbB, frag.a);
}

void main() {
    #if ANTI_ALIASING == AA_FXAA
    fragColor = fxaa(u_source, texcoord);
    #else
    fragColor = texture(u_source, texcoord);
    #endif
}