#version 300 es

precision mediump float;
precision mediump sampler2D;

uniform sampler2D u_texture;

in vec2 v_position;
in vec2 v_texture_coordinates;

out vec4 frag_color;

void main(void) {
  // [-1 : +1]
  float value = texture(u_texture, v_texture_coordinates).r;
  frag_color = vec4(0., 0.5 + 0.5 * value, 0., 1.);
}
