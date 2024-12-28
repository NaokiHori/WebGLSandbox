#version 300 es

precision mediump float;

const float PI = 3.14159265358979323846;

// [-1 : +1]
in vec2 v_position;

out float frag_color;

void main(void) {
  // [0 : 1]
  vec2 position = 0.5 + 0.5 * v_position;
  frag_color = sin(2. * PI * position.x) * sin(2. * PI * position.y);
}
