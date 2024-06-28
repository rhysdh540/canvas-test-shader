#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:config/post
#include grass:shaders/lib/sharpening.glsl

uniform sampler2D u_source;
in vec2 texcoord;
layout(location = 0) out vec4 fragColor;

void main() {
    #if SHARPENING == SHARPENING_CAS
    fragColor = cas(u_source, texcoord);
    #elif SHARPENING == SHARPENING_DLS
    fragColor = dls(u_source, texcoord);
    #else
    fragColor = texture(u_source, texcoord);
    #endif
}