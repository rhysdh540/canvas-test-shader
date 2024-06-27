#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl

uniform sampler2D u_source;
in vec2 texcoord;
layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = texture(u_source, texcoord);
}