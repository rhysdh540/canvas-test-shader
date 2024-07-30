#include frex:shaders/api/header.glsl
#include grass:shaders/lib/aa/smaa.glsl

layout(location = 0) out vec4 fragColor;

in vec2 texcoord;
in vec4[3] offsets;

uniform sampler2D u_source;

void main() {
    #if SMAA_EDGE_DETECTION == SMAA_EDGE_DETECTION_DEPTH
    // todo
    #elif SMAA_EDGE_DETECTION == SMAA_EDGE_DETECTION_COLOR
    fragColor = vec4(SMAAColorEdgeDetectionPS(texcoord, offsets, u_source), 0.0, 0.0);
    #elif SMAA_EDGE_DETECTION == SMAA_EDGE_DETECTION_LUMA
    fragColor = vec4(SMAALumaEdgeDetectionPS(texcoord, offsets, u_source), 0.0, 0.0);
    #else
    #error "Invalid SMAA_EDGE_DETECTION"
    #endif
}