#version 300 es

precision highp float;
precision highp sampler2D;

const float BC_B = 0.;
const float BC_T = 0.;
const float BC_L = 1.;
const float BC_R = 1.;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_grid_size;
uniform float u_time_step_size;
uniform float u_diffusivity;

out float frag_color;

bool is_left_bound(float frag_coord_x) {
  return int(frag_coord_x) == 0;
}

bool is_right_bound(float frag_coord_x) {
  return int(frag_coord_x) == int(u_resolution.x) - 1;
}

bool is_bottom_bound(float frag_coord_y) {
  return int(frag_coord_y) == 0;
}

bool is_top_bound(float frag_coord_y) {
  return int(frag_coord_y) == int(u_resolution.y) - 1;
}

float compute_laplacian(
    float value_c,
    float value_l,
    float value_r,
    float value_b,
    float value_t
) {
  float x_comp = (value_l - 2. * value_c + value_r) / (u_grid_size[0] * u_grid_size[0]);
  float y_comp = (value_b - 2. * value_c + value_t) / (u_grid_size[1] * u_grid_size[1]);
  return x_comp + y_comp;
}

void main(void) {
  vec2 frag_coord = gl_FragCoord.xy;
  ivec2 i_frag_coord = ivec2(frag_coord);
  // values are between [-1 : +1]
  float value_b = is_bottom_bound(frag_coord.y) ? BC_B : texelFetch(u_texture, i_frag_coord + ivec2( 0, -1), 0).r;
  float value_l =   is_left_bound(frag_coord.x) ? BC_L : texelFetch(u_texture, i_frag_coord + ivec2(-1,  0), 0).r;
  float value_c =                                        texelFetch(u_texture, i_frag_coord,                 0).r;
  float value_r =  is_right_bound(frag_coord.x) ? BC_R : texelFetch(u_texture, i_frag_coord + ivec2(+1,  0), 0).r;
  float value_t =    is_top_bound(frag_coord.y) ? BC_T : texelFetch(u_texture, i_frag_coord + ivec2( 0, +1), 0).r;
  float delta = compute_laplacian(value_c, value_l, value_r, value_b, value_t);
  float new_value = value_c + u_diffusivity * u_time_step_size * delta;
  frag_color = new_value;
}
