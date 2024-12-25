#version 300 es

precision highp float;

const float PI = 3.14159265358979323846;

uniform float u_lorenz_sigma;
uniform float u_lorenz_rho;
uniform float u_lorenz_beta;
uniform float u_dt;
uniform mat4 u_mvp_matrix;
uniform float u_point_size;

in vec3 a_color;
in vec3 a_position_old;

out vec3 a_position_new;
out vec3 v_color;

vec3 compute_velocity(vec3 position) {
  float x = position.x;
  float y = position.y;
  float z = position.z;
  return vec3(
      u_lorenz_sigma * (y - x),
      x * (u_lorenz_rho - z) - y,
      x * y - u_lorenz_beta * z
  );
}

vec3 update_position(vec3 position) {
  // two-stage Runge-Kutta scheme
  vec3 velocity = compute_velocity(position);
  position = position + 0.5 * u_dt * velocity;
  velocity = compute_velocity(position);
  return position + u_dt * velocity;
}

void main(void) {
  gl_PointSize = 5.;
  a_position_new = update_position(a_position_old);
  vec4 position = vec4(
      a_position_new.x / u_lorenz_rho,
      a_position_new.y / u_lorenz_rho,
      a_position_new.z / u_lorenz_rho - 1.,
      1.
  );
  gl_Position = u_mvp_matrix * position;
  v_color = a_color;
}
