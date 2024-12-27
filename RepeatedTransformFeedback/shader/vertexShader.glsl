#version 300 es

precision highp float;

const float PI = 3.14159265358979323846;

const float LORENZ_RHO_MAX = 50.;
const float LORENZ_SIGMA = 10.;
const float LORENZ_BETA = 8. / 3.;

uniform float u_dt;
uniform mat4 u_mvp_matrix;
uniform float u_point_size;

in float a_lorenz_rho;
in vec3 a_color;
in vec3 a_position_old;

out vec3 a_position_new;
out vec3 v_color;

vec3 compute_velocity(float lorenz_rho, vec3 position) {
  float x = position.x;
  float y = position.y;
  float z = position.z;
  return vec3(
      LORENZ_SIGMA * (y - x),
      x * (lorenz_rho - z) - y,
      x * y - LORENZ_BETA * z
  );
}

vec3 update_position(float lorenz_rho, vec3 position) {
  // two-stage Runge-Kutta scheme
  vec3 velocity = compute_velocity(lorenz_rho, position);
  position = position + 0.5 * u_dt * velocity;
  velocity = compute_velocity(lorenz_rho, position);
  return position + u_dt * velocity;
}

void main(void) {
  gl_PointSize = 5.;
  a_position_new = update_position(a_lorenz_rho, a_position_old);
  vec4 position = vec4(
      a_position_new.x / LORENZ_RHO_MAX,
      a_position_new.y / LORENZ_RHO_MAX,
      a_position_new.z / LORENZ_RHO_MAX - 1.,
      1.
  );
  gl_Position = u_mvp_matrix * position;
  v_color = a_color;
}
