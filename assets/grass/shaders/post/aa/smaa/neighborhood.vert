#include frex:shaders/api/header.glsl
#include grass:shaders/lib/aa/smaa.glsl

out vec2 texcoord;
out vec4 offset;

void main() {
    gl_Position = vec4(
        gl_VertexID == 1 ? 3.0 : -1.0,
        gl_VertexID == 2 ? 3.0 : -1.0,
        0.0,
        1.0
    );

    texcoord = vec2(
        gl_VertexID == 1 ? 2.0 : 0.0,
        gl_VertexID == 2 ? 2.0 : 0.0
    );

    SMAANeighborhoodBlendingVS(texcoord, offset);
}