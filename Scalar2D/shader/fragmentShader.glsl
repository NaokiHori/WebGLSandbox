#version 300 es

precision mediump float;

uniform sampler2D u_texture;

in vec2 v_texture_coordinates;

out vec4 frag_color;

void main(void) {
  float value = texture(u_texture, v_texture_coordinates).r;
  frag_color = vec4(vec3(value), 1.);
}

