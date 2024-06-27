#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl
#include grass:shaders/lib/fxaa.glsl

uniform sampler2D u_source;
in vec2 texcoord;
layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = fxaa(u_source, texcoord);
}