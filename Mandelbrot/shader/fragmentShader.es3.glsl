#version 300 es

precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_ref;

out vec4 frag_color;

const float PI = 3.141592653589793;

#define POW2(x) ((x) * (x))

const int iter_max = 128;
const float factor = 1.e0;
const vec2 P_ORIGIN = vec2(-0.5, 0.);

const float MAX_DIST = 2.;

#define COLOR_ORDER 6

void main (void) {
  vec3 RGBCOEFS[COLOR_ORDER];
  RGBCOEFS[0] = vec3(
      -1.152330597625775e-04,
      -9.343505692424506e-05,
      +1.831902270674093e-03
  );
  RGBCOEFS[1] = vec3(
      +4.275424458282195e-01,
      +5.143306337969607e-02,
      +2.685289127841018e-01
  );
  RGBCOEFS[2] = vec3(
      +4.765794513554184e+00,
      +1.389513884781248e+00,
      +1.073807348121532e+01
  );
  RGBCOEFS[3] = vec3(
      -1.012625390879868e+01,
      -1.727570502707826e+00,
      -2.192489501380630e+01
  );
  RGBCOEFS[4] = vec3(
      +8.095329792154899e-01,
      +3.525127167237564e+00,
      +1.393447104954753e+01
  );
  RGBCOEFS[5] = vec3(
       4.495067596368988e+00,
      -2.246804055080015e+00,
      -2.203634055012538e+00
  );
  float asp = u_resolution.x / u_resolution.y;
  float radius = asp < 1. ? asp : 1.;
  vec2 uv = 2. * (gl_FragCoord.xy / u_resolution.y - vec2(0.5 * asp, 0.5));
  vec2 p_this = factor * uv + P_ORIGIN;
  vec2 p_curr = p_this;
  float min_dist = 1e16;
  for (int iter = 0; iter < iter_max; iter += 1) {
    min_dist = min(min_dist, distance(p_curr, u_ref));
    vec2 p_next = vec2(
        p_this.x + POW2(p_curr.x) - POW2(p_curr.y),
        p_this.y + 2. * p_curr.x * p_curr.y
    );
    p_curr = p_next;
  }
  float rate = 1. - clamp(min_dist / MAX_DIST, 0., 1.);
  //
  vec3 color = RGBCOEFS[COLOR_ORDER - 1];
  for (int n = 0; n < COLOR_ORDER - 1; n++) {
    color *= rate;
    color += RGBCOEFS[COLOR_ORDER - 2 - n];
  }
  frag_color = vec4(color, 1.);
}

