#include tutorialpack:shaders/post/header.glsl

uniform sampler2D u_source;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = texture(u_source, texcoord);
}