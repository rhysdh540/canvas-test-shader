#include tutorialpack:shaders/lib/header.glsl

// Cascade level that is currently rendering, 0-3
uniform int frxu_cascade;

void frx_pipelineVertex() {
    // Move to camera origin
    vec4 shadowVertex = frx_vertex + frx_modelToCamera;
    gl_Position = frx_shadowViewProjectionMatrix(frxu_cascade) * shadowVertex;
}