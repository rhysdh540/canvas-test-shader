vec4 fxaa(sampler2D tex, vec2 fragCoord) {
    vec2 inverseResolution = 1.0 / vec2(frxu_size);
    vec4 frag = texture(tex, fragCoord);

    vec3 rgbNW = texture(tex, fragCoord + vec2(-1.0, -1.0) * inverseResolution).rgb;
    vec3 rgbNE = texture(tex, fragCoord + vec2(1.0, -1.0) * inverseResolution).rgb;
    vec3 rgbSW = texture(tex, fragCoord + vec2(-1.0, 1.0) * inverseResolution).rgb;
    vec3 rgbSE = texture(tex, fragCoord + vec2(1.0, 1.0) * inverseResolution).rgb;
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

    vec3 rgbA = 0.5 * (texture(tex, fragCoord + dir * (1.0 / 3.0 - 0.5)).rgb +
    texture(tex, fragCoord + dir * (2.0 / 3.0 - 0.5)).rgb);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (texture(tex, fragCoord + dir * 0.5).rgb +
    texture(tex, fragCoord - dir * 0.5).rgb);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
        return vec4(rgbA, frag.a);
    }
    return vec4(rgbB, frag.a);
}