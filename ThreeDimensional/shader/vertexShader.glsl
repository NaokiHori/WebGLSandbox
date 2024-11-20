#version 300 es

uniform mat4 u_mvp_matrix;

in vec3 a_position;
in vec3 a_normal;
in vec4 a_color;

out vec3 v_position;
out vec3 v_normal;
out vec4 v_color;

void main(void) {
  v_position = a_position;
  v_normal = a_normal;
  v_color = a_color;
  gl_Position = u_mvp_matrix * vec4(a_position, 1.);
}

