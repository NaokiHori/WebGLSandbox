#version 300 es

uniform mat4 u_mvp_matrix;
uniform vec3 u_diffuse_light;
uniform vec4 u_ambient_light_color;
uniform float u_use_diffuse_light;

in vec3 a_position;
in vec3 a_normal;
in vec4 a_color;

out vec4 v_color;

void main (void) {
  if (0.5 < u_use_diffuse_light) {
    // NOTE: light is flipped to be in accordance with the definition of surface normal
    float diffuse_factor = clamp(dot(a_normal, - u_diffuse_light), 0., 1.);
    vec4 diffuse_lighted_color = a_color * vec4(vec3(diffuse_factor), 1.) + u_ambient_light_color;
    v_color = clamp(diffuse_lighted_color, vec4(0.), vec4(1.));
  } else {
    v_color = a_color;
  }
  gl_Position = u_mvp_matrix * vec4(a_position, 1.);
}

