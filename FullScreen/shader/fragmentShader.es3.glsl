#version 300 es

precision mediump float;

in vec2 v_position;

out vec4 frag_color;

void main(void) {
  float radius = 1.;
  if (radius < length(v_position)) {
    frag_color = vec4(0., 0., 0., 1.);
  } else {
    frag_color = vec4(0.5 + 0.5 * v_position.x, 0.5 + 0.5 * v_position.y, 0.5 - 0.5 * v_position.x, 1.);
  }
}

