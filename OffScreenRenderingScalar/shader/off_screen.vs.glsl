#version 300 es

precision mediump float;

// [-1 : +1]
in vec2 a_position;

out vec2 v_position;

void main(void) {
  v_position = a_position;
  gl_Position = vec4(a_position, 0., 1.);
}
