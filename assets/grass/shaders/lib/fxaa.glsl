// drop in replacement for texture(imag, texcoord) function that fxaa's the image
vec4 fxaa(sampler2D imag, vec2 texcoord) {
    vec2 inverseResolution = 1.0 / vec2(frxu_size);
    vec4 frag = texture(imag, texcoord);

    vec3 rgbNW = texture(imag, texcoord + vec2(-1.0, -1.0) * inverseResolution).rgb;
    vec3 rgbNE = texture(imag, texcoord + vec2(1.0, -1.0) * inverseResolution).rgb;
    vec3 rgbSW = texture(imag, texcoord + vec2(-1.0, 1.0) * inverseResolution).rgb;
    vec3 rgbSE = texture(imag, texcoord + vec2(1.0, 1.0) * inverseResolution).rgb;
    vec3 rgbM  = frag.rgb;

    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);

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

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
        return vec4(rgbA, frag.a);
    }
    return vec4(rgbB, frag.a);
}