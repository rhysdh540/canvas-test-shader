#include frex:shaders/api/view.glsl

#define SMAA_GLSL_3 1
#define SMAA_PRESET_HIGH 1
#define SMAA_RT_METRICS vec4(1.0 / frx_viewWidth, 1.0 / frx_viewHeight, frx_viewWidth, frx_viewHeight)

#if defined(FRAGMENT_SHADER)
    #define SMAA_INCLUDE_VS 0
    #define SMAA_INCLUDE_PS 1
#elif defined(VERTEX_SHADER)
    #define SMAA_INCLUDE_VS 1
    #define SMAA_INCLUDE_PS 0
#else
    #error "whar"
#endif

#include grass:shaders/lib/aa/smaa.hlsl

vec2[] positions = vec2[](
    vec2(-1.0, -1.0),
    vec2(3.0, -1.0),
    vec2(-1.0, 3.0)
);

vec2[] texture_coordinates = vec2[](
    vec2(0.0, 0.0),
    vec2(2.0, 0.0),
    vec2(0.0, 2.0)
);