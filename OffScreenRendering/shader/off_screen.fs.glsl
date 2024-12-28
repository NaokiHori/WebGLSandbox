#version 300 es

precision mediump float;

// [0 : 1]
in vec2 v_position;

out vec4 frag_color;

void main(void) {
  frag_color = vec4(0., 1., 0., 1.);
}
