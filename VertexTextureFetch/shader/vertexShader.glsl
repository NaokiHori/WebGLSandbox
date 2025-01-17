#version 300 es

precision highp float;
precision highp sampler2D;

uniform mat4 u_mvp_matrix;
uniform ivec2 u_scalar_grid;
uniform sampler2D u_scalar_height;
uniform sampler2D u_scalar_normal;

in vec2 a_position;
in vec3 a_normal;

out vec3 v_normal;

void main(void) {
  int i = gl_VertexID % u_scalar_grid[0];
  int j = gl_VertexID / u_scalar_grid[0];
  float z = texelFetch(u_scalar_height, ivec2(i, j), 0).r;
  vec3 normal = texelFetch(u_scalar_normal, ivec2(i, j), 0).rgb;
  v_normal = a_normal + normal;
  gl_Position = u_mvp_matrix * vec4(a_position, z, 1.);
}

