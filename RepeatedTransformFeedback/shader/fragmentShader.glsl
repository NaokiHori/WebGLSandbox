#version 300 es

precision lowp float;

in vec3 v_color;

out vec4 frag_color;

const float PI = 3.141592653589793238;

void main(void) {
  float distance_from_center = length(2. * gl_PointCoord - 1.);
  // draw circle
  if (1. < distance_from_center) {
    discard;
  } else {
    frag_color = vec4(pow(1. - distance_from_center, 0.5) * v_color, 1.);
  }
}
