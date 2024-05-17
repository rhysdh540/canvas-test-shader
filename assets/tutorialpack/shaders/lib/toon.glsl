#include tutorialpack:shaders/lib/util.glsl
#include tutorialpack:toon_config

float posterize(float val) {
    return floor(val * POSTERIZATION_LEVELS) / POSTERIZATION_LEVELS;
}

#ifdef SMOOTH_CEL
float stepper(in float x) {
    float raw = CEL_STEPS * x;
    float value = int(raw + 0.5) - 0.5;
    float change = smoothstep(0.0, 1.0,  pow(raw - value, CEL_HARDNESS));
    if(value > raw) {
        change = change * -1.0;
    }
    float ret = (value + change)  * (1.0 / CEL_STEPS);
    return ret;
}
#else
float stepper(in float x) {
    int value = int(CEL_STEPS * x + 0.5); //int between 0 and steps+0.5
    float ret = (float(value) - 0.5)  * (1.0 / CEL_STEPS);
    return ret;
}
#endif

const float zNear = 0.0001;
const float zFar = 1000.0;
float linearize_depth(float d) {
    float z_n = 2.0 * d - 1.0;
    return 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));
}

void celShade(inout vec3 hsv, float depth) {

    if(depth == 1.0) { // do not affect sky
        return;
    }

    hsv.z = stepper(hsv.z);

    if(hsv.y != 0) { // Make sure that white color is not distorted
        hsv.y = min(hsv.y + CHROMA_ADD, 1.0);
    }

    float ldepth = linearize_depth(depth);
    if(ldepth > 0.2) {
        hsv.z = min(1.0, hsv.z + (ldepth - 0.2) * 0.05);
        hsv.y = max(0.0, hsv.y - (ldepth - 0.2) * 0.10);
    }
}