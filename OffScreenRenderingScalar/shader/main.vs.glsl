#version 300 es

precision mediump float;

in vec2 a_position;
in vec2 a_texture_coordinates;

out vec2 v_position;
out vec2 v_texture_coordinates;

void main(void) {
  v_position = 0.5 + a_position;
  v_texture_coordinates = a_texture_coordinates;
  gl_Position = vec4(a_position, 0., 1.);
}
