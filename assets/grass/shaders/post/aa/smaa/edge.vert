#include frex:shaders/api/header.glsl
#include grass:shaders/lib/aa/smaa.glsl

out vec2 texcoord;
out vec4[3] offsets;

void main() {
    texcoord = texture_coordinates[gl_VertexID];
    SMAAEdgeDetectionVS(texcoord, offsets);
    gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}