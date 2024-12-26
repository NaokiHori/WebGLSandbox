#version 300 es

precision highp float;

const float PI = 3.14159265358979323846;

const float LORENZ_RHO_MAX = 75.;

uniform float u_dt;
uniform mat4 u_mvp_matrix;
uniform float u_point_size;

in vec3 a_color;
in vec3 a_lorenz_params;
in vec3 a_position_old;

out vec3 a_position_new;
out vec3 v_color;

vec3 compute_velocity(vec3 lorenz_params, vec3 position) {
  float lorenz_sigma = lorenz_params.x;
  float lorenz_rho   = lorenz_params.y;
  float lorenz_beta  = lorenz_params.z;
  float x = position.x;
  float y = position.y;
  float z = position.z;
  return vec3(
      lorenz_sigma * (y - x),
      x * (lorenz_rho - z) - y,
      x * y - lorenz_beta * z
  );
}

vec3 update_position(vec3 lorenz_params, vec3 position) {
  // two-stage Runge-Kutta scheme
  vec3 velocity = compute_velocity(lorenz_params, position);
  position = position + 0.5 * u_dt * velocity;
  velocity = compute_velocity(lorenz_params, position);
  return position + u_dt * velocity;
}

void main(void) {
  gl_PointSize = 5.;
  a_position_new = update_position(a_lorenz_params, a_position_old);
  vec4 position = vec4(
      a_position_new.x / LORENZ_RHO_MAX,
      a_position_new.y / LORENZ_RHO_MAX,
      a_position_new.z / LORENZ_RHO_MAX - 1.,
      1.
  );
  gl_Position = u_mvp_matrix * position;
  v_color = a_color;
}
