#include frex:shaders/api/vertex.glsl
#include frex:shaders/api/view.glsl

// Cascade level that is currently rendering, 0-3
uniform int frxu_cascade;

void frx_pipelineVertex() {
    // Move to camera origin
    vec4 shadowVertex = frx_vertex + frx_modelToCamera;
    gl_Position = frx_shadowViewProjectionMatrix(frxu_cascade) * shadowVertex;

    shadowViewPos = frx_shadowViewMatrix * vec4(frx_vertex.xyz + frx_vertexNormal.xyz * 0.1, frx_vertex.w);
}