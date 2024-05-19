#include tutorialpack:shaders/post/header.glsl
#include tutorialpack:shaders/lib/util.glsl
#include tutorialpack:shaders/lib/toon.glsl

uniform sampler2D u_source;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

void main() {
    vec4 color = texture(u_source, texcoord);

    #if SHADING_TYPE != TOON_SHADING_OFF
    vec3 hsv = rgb2hsv(color.rgb);
        #if SHADING_TYPE == TOON_SHADING_POSTERIZATION
            hsv.z = posterize(hsv.z);
        #elif SHADING_TYPE == TOON_SHADING_CEL_SHADING
            celShade(hsv, gl_FragCoord.z);
        #endif
        color = vec4(hsv2rgb(hsv), color.a);
    #endif

    fragColor = color;
}