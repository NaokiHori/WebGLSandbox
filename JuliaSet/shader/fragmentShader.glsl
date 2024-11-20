#version 300 es

precision mediump float;

uniform float u_domain_size;
uniform vec2 u_resolution;
uniform vec2 u_orig;
uniform vec2 u_ref;

out vec4 frag_color;

const float PI = 3.141592653589793;

const int ITER_MAX = 16;
const vec2 P_ORIGIN = vec2(0., 0.);

const float MAX_DIST = 2.;

const float ANGLE = 2. * PI / 3.;

#define COLOR_ORDER 6

vec2 transform_to_screen_coordinate(vec2 point) {
  float asp = u_resolution.x / u_resolution.y;
  if (asp < 1.) {
    return u_domain_size * (point / u_resolution.x - vec2(0.5, 0.5 / asp)) + P_ORIGIN;
  } else {
    return u_domain_size * (point / u_resolution.y - vec2(0.5 * asp, 0.5)) + P_ORIGIN;
  }
}

vec2 rotate(float angle, vec2 orig) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(
      orig.x * c - orig.y * s,
      orig.x * s + orig.y * c
  );
}

float find_distance(float angle, vec2 orig, vec2 p, vec2 ref) {
  vec2 orig_rotated = rotate(angle, orig);
  vec2 p_rotated = rotate(angle, p);
  vec2 ref_rotated = rotate(angle, ref);
  float dist = 1e16;
  for (int iter = 0; iter < ITER_MAX; iter += 1) {
    p_rotated = vec2(
        orig_rotated.x + p_rotated.x * p_rotated.x - p_rotated.y * p_rotated.y,
        orig_rotated.y + p_rotated.x * p_rotated.y + p_rotated.x * p_rotated.y
    );
    dist = min(dist, distance(p_rotated, ref_rotated));
  }
  return dist;
}

vec3 get_rgb(float reds[COLOR_ORDER], float greens[COLOR_ORDER], float blues[COLOR_ORDER], float value) {
  vec3 color = vec3(
      reds[COLOR_ORDER - 1],
      greens[COLOR_ORDER - 1],
      blues[COLOR_ORDER - 1]
  );
  for (int i = COLOR_ORDER - 2; i >= 0; i--) {
    color = color * value + vec3(reds[i], greens[i], blues[i]);
  }
  return color;
}

void main(void) {
  float [COLOR_ORDER] reds = float[](
      -1.152330597625775e-04,
      +4.275424458282195e-01,
      +4.765794513554184e+00,
      -1.012625390879868e+01,
      +8.095329792154899e-01,
      +4.495067596368988e+00
  );
  float [COLOR_ORDER] greens = float[](
      -9.343505692424506e-05,
      +5.143306337969607e-02,
      +1.389513884781248e+00,
      -1.727570502707826e+00,
      +3.525127167237564e+00,
      -2.246804055080015e+00
  );
  float [COLOR_ORDER] blues = float[](
      +1.831902270674093e-03,
      +2.685289127841018e-01,
      +1.073807348121532e+01,
      -2.192489501380630e+01,
      +1.393447104954753e+01,
      -2.203634055012538e+00
  );
  vec2 ref = u_ref;
  vec2 p = transform_to_screen_coordinate(gl_FragCoord.xy);
  vec2 orig = vec2(1., -1.) * u_orig;
  float dist0 = find_distance(0. * ANGLE, orig, p, ref);
  float dist1 = find_distance(1. * ANGLE, orig, p, ref);
  float dist2 = find_distance(2. * ANGLE, orig, p, ref);
  float value0 = 1. - clamp(dist0 / MAX_DIST, 0., 1.);
  float value1 = 1. - clamp(dist1 / MAX_DIST, 0., 1.);
  float value2 = 1. - clamp(dist2 / MAX_DIST, 0., 1.);
  vec3 color0 = get_rgb(reds, greens, blues, value0);
  vec3 color1 = get_rgb(greens, blues, reds, value1);
  vec3 color2 = get_rgb(blues, reds, greens, value2);
  frag_color = clamp(vec4(max(color0, max(color1, color2)), 1.), 0., 1.);
}

