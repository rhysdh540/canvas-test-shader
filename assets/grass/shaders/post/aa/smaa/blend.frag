#include frex:shaders/api/header.glsl
#include grass:shaders/lib/aa/smaa.glsl

layout(location = 0) out vec4 fragColor;

in vec2 texcoord;
in vec2 pixelCoord;
in vec4[3] offsets;

uniform sampler2D u_edges;
uniform sampler2D u_search;
uniform sampler2D u_area;

void main() {
    fragColor = SMAABlendingWeightCalculationPS(texcoord, pixelCoord, offsets, u_edges, u_area, u_search, vec4(0.0));
}