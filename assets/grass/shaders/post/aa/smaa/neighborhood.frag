#include frex:shaders/api/header.glsl
#include grass:shaders/lib/aa/smaa.glsl

layout(location = 0) out vec4 fragColor;

in vec2 texcoord;
in vec4 offset;

uniform sampler2D u_source;
uniform sampler2D u_blend;

void main() {
    fragColor = SMAANeighborhoodBlendingPS(texcoord, offset, u_source, u_blend);
}