#include grass:shaders/lib/header.glsl
#include grass:shaders/lib/util.glsl

void frx_pipelineVertex() {
    if(frx_modelOriginScreen) {
        // position of hand and gui
        gl_Position = frx_guiViewProjectionMatrix * frx_vertex;
    } else {
        // position of world
        frx_vertex += frx_modelToCamera;
        gl_Position = frx_viewProjectionMatrix * frx_vertex;
    }
}