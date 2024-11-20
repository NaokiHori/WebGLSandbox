#version 300 es

precision mediump float;

uniform float u_point_size;
uniform vec2 u_scale;

in vec2 a_position;

out vec4 v_position;

void main(void) {
  gl_PointSize = u_point_size;
  vec4 position = vec4(a_position, 0., 1.);
  vec4 scale = vec4(u_scale, 0., 1.);
  v_position = position * scale;
  gl_Position = v_position;
}
