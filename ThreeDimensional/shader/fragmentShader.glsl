#version 300 es

// NOTE: direction of surface normal is from interior to exterior

precision mediump float;

uniform float u_use_diffuse_light;
uniform float u_use_ambient_light;
uniform float u_use_specular_light;
uniform vec3 u_diffuse_light;
uniform vec3 u_line_of_sight;
uniform vec4 u_ambient_light_color;
uniform mat4 u_inverse_model_matrix;

in vec3 v_position;
in vec3 v_normal;
in vec4 v_color;

out vec4 frag_color;

bool use_diffuse_light(void) {
  return 0.5 < u_use_diffuse_light;
}

bool use_ambient_light(void) {
  return 0.5 < u_use_ambient_light;
}

bool use_specular_light(void) {
  return 0.5 < u_use_specular_light;
}

vec3 apply_inverse_model_matrix(vec3 vector) {
  return (u_inverse_model_matrix * vec4(vector, 0.)).xyz;
}

// decide brightness, determined by the surface normal and light direction
float compute_diffuse_factor(vec3 diffuse_light) {
  return clamp(dot(normalize(v_normal), - normalize(diffuse_light)), 0., 1.);
}

// decide brightness, determined by the ambient light color
vec4 compute_ambient_offset(void) {
  return u_ambient_light_color;
}

// decide brightness, determined by the surface normal and half vector
float compute_specular_offset(vec3 diffuse_light) {
  if (use_specular_light()) {
    vec3 line_of_sight = apply_inverse_model_matrix(u_line_of_sight);
    vec3 half_vector = normalize(diffuse_light) + normalize(line_of_sight);
    return pow(clamp(dot(normalize(v_normal), - normalize(half_vector)), 0., 1.), 50.);
  } else {
    return 0.;
  }
}

void main(void) {
  // decide surface color, influenced by
  // - diffuse light
  // - ambient light
  // - specular light
  vec4 color = v_color;
  vec3 diffuse_light = apply_inverse_model_matrix(u_diffuse_light);
  if (use_diffuse_light()) {
    float diffuse_factor = compute_diffuse_factor(diffuse_light);
    color *= vec4(vec3(diffuse_factor), 1.);
  }
  if (use_ambient_light()) {
    vec4 ambient_offset = compute_ambient_offset();
    color += ambient_offset;
  }
  if (use_specular_light()) {
    float specular_offset = compute_specular_offset(diffuse_light);
    color += vec4(vec3(specular_offset), 0.);
  }
  color = clamp(color, 0., 1.);
  frag_color = color;
}

