#include frex:shaders/api/vertex.glsl
#include frex:shaders/api/view.glsl

out vec4 shadowViewPos;

void frx_pipelineVertex() {
    if(frx_modelOriginScreen) {
        // position of hand and gui
        gl_Position = frx_guiViewProjectionMatrix * frx_vertex;
    } else {
        // position of world
        frx_vertex += frx_modelToCamera;
        gl_Position = frx_viewProjectionMatrix * frx_vertex;
    }

    shadowViewPos = frx_shadowViewMatrix * vec4(frx_vertex.xyz + frx_vertexNormal.xyz * 0.1, frx_vertex.w);
}