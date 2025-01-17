#version 300 es

precision highp float;

uniform vec3 u_light;
in vec3 v_normal;

out vec4 frag_color;

void main(void) {
  float color = 0.1;
  color += clamp(dot(normalize(v_normal), - normalize(u_light)), 0., 1.);
  color = clamp(color, 0., 1.);
  frag_color = vec4(vec3(color), 1.);
}

