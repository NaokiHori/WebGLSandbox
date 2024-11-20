#version 300 es

precision mediump float;

uniform sampler2D u_texture;

in vec2 v_texture_coordinates;

out vec4 frag_color;

void main(void) {
  frag_color = texture(u_texture, v_texture_coordinates);
}

