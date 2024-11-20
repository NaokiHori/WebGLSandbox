#version 300 es

precision mediump float;

in vec4 v_position;

out vec4 frag_color;

const float PI = 3.141592653589793238;

float atan2(
    float x,
    float y
) {
  return 0. == x ? 0. : atan(y, x);
}

void main(void) {
  // gl_PointCoord is defined in [0 : 1],
  //   which is converted to [-1 : +1]
  float distance_from_center = length(2. * gl_PointCoord - 1.);
  // draw circle
  if (1. < distance_from_center) {
    // external
    discard;
  } else {
    // internal
    float arg = atan2(v_position.y, v_position.x);
    float r = 0.5 * (1. + sin(arg + 2. * PI / 3. * 0.));
    float g = 0.5 * (1. + sin(arg + 2. * PI / 3. * 1.));
    float b = 0.5 * (1. + sin(arg + 2. * PI / 3. * 2.));
    frag_color = vec4(r, g, b, 1.);
  }
}
