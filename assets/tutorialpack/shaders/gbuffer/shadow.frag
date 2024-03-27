#include frex:shaders/api/material.glsl
#include frex:shaders/api/fragment.glsl

void frx_pipelineFragment() {
    // Shadow pass only cares about depth
    gl_FragDepth = gl_FragCoord.z;
}