#version 300 es

precision highp float;

const float PI = 3.14159265358979323846;
const float DT = 0.01;

const float SIGMA = 10.;
const float RHO = 28.;
const float BETA = 8. / 3.;

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
      SIGMA * (y - x),
      x * (RHO - z) - y,
      x * y - BETA * z
  );
}

vec3 update_position(vec3 position) {
  // two-stage Runge-Kutta scheme
  vec3 velocity = compute_velocity(position);
  position = position + 0.5 * DT * velocity;
  velocity = compute_velocity(position);
  return position + DT * velocity;
}

void main(void) {
  gl_PointSize = 5.;
  a_position_new = update_position(a_position_old);
  vec4 position = vec4(
      a_position_new.x / RHO,
      a_position_new.y / RHO,
      a_position_new.z / RHO - 1.,
      1.
  );
  gl_Position = u_mvp_matrix * position;
  v_color = a_color;
}
