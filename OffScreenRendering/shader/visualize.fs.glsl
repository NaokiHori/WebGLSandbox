#version 300 es

precision mediump float;
precision mediump sampler2D;

uniform sampler2D u_texture;

in vec2 v_texture_coordinates;

out vec4 frag_color;

void main(void) {
  float value = texture(u_texture, v_texture_coordinates).r;
  float r = value < 0.5 ? 1. : 2. - 2. * value;
  float g = value < 0.5 ? 2. * value : 2. - 2. * value;
  float b = value < 0.5 ? 2. * value : 1.;
  frag_color = vec4(r, g, b, 1.);
}

