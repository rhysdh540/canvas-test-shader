#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/fxaa.glsl
#include grass:config/post

uniform sampler2D u_source;
in vec2 texcoord;
layout(location = 0) out vec4 fragColor;

void main() {
    #if ANTI_ALIASING == AA_FXAA
    fragColor = fxaa(u_source, texcoord);
    #else
    fragColor = texture(u_source, texcoord);
    #endif
}