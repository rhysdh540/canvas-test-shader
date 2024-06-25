#include tutorialpack:shaders/lib/header.glsl

void frx_pipelineFragment() {
    // Shadow pass only cares about depth
    gl_FragDepth = gl_FragCoord.z;
}