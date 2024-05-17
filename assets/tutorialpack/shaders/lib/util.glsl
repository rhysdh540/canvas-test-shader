#ifndef UTIL_INCLUDED
#define UTIL_INCLUDED

#define ID_RES_SUN 1
#define ID_RES_MOON 2

#ifdef COLOR_GAMMA
    #define hdr_gamma COLOR_GAMMA
#else
    #define hdr_gamma 2.0
#endif

#define hdr_fromGamma(x) pow(x, vec3(hdr_gamma))
#define IS_GUI frx_isGui && !frx_isHand

#include frex:shaders/lib/math.glsl

#endif