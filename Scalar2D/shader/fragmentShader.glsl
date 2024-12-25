#version 300 es

precision mediump float;
precision mediump sampler2DArray;

uniform sampler2DArray u_texture;

in vec2 v_texture_coordinates;

out vec4 frag_color;

void main(void) {
  // assuming three textures
  float value0 = texture(u_texture, vec3(v_texture_coordinates, 0.)).r;
  float value1 = texture(u_texture, vec3(v_texture_coordinates, 1.)).r;
  float value2 = texture(u_texture, vec3(v_texture_coordinates, 2.)).r;
  frag_color = vec4(value0, value1, value2, 1.);
}

