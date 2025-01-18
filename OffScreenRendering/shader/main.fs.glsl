#version 300 es

precision highp float;
precision highp sampler2D;

const float BC_B = 0.;
const float BC_T = 0.;
const float BC_L = 1.;
const float BC_R = 1.;

uniform sampler2D temp;

uniform vec2 u_resolution;
uniform vec2 u_grid_size;
uniform float u_time_step_size;
uniform float u_diffusivity;

out float new_temp;

bool is_left(float frag_coord_x) {
  return int(frag_coord_x) == 0;
}

bool is_right(float frag_coord_x) {
  return int(frag_coord_x) == int(u_resolution.x) - 1;
}

bool is_bottom(float frag_coord_y) {
  return int(frag_coord_y) == 0;
}

bool is_top(float frag_coord_y) {
  return int(frag_coord_y) == int(u_resolution.y) - 1;
}

float compute_laplacian(
    float temp_c,
    float temp_l,
    float temp_r,
    float temp_b,
    float temp_t
) {
  float x_comp = (temp_l - 2. * temp_c + temp_r) / (u_grid_size[0] * u_grid_size[0]);
  float y_comp = (temp_b - 2. * temp_c + temp_t) / (u_grid_size[1] * u_grid_size[1]);
  return x_comp + y_comp;
}

void main(void) {
  vec2 frag_coord = gl_FragCoord.xy;
  ivec2 i_frag_coord = ivec2(frag_coord);
  float temp_b = is_bottom(frag_coord.y) ? BC_B : texelFetch(temp, i_frag_coord + ivec2( 0, -1), 0).r;
  float temp_l =   is_left(frag_coord.x) ? BC_L : texelFetch(temp, i_frag_coord + ivec2(-1,  0), 0).r;
  float temp_c =                                  texelFetch(temp, i_frag_coord,                 0).r;
  float temp_r =  is_right(frag_coord.x) ? BC_R : texelFetch(temp, i_frag_coord + ivec2(+1,  0), 0).r;
  float temp_t =    is_top(frag_coord.y) ? BC_T : texelFetch(temp, i_frag_coord + ivec2( 0, +1), 0).r;
  float delta = compute_laplacian(temp_c, temp_l, temp_r, temp_b, temp_t);
  new_temp = temp_c + u_diffusivity * u_time_step_size * delta;
}
