#version 300 es

precision mediump float;

uniform vec2 u_resolution;

out vec4 frag_color;

void main (void) {
  float asp = u_resolution.x / u_resolution.y;
  float radius = asp < 1. ? asp : 1.;
  // normalized horizontal Euclidean coordinate ([-asp, asp])
  // normalized vertical   Euclidean coordinate ([  -1,   1])
  vec2 uv = 2. * (gl_FragCoord.xy / u_resolution.y - vec2(0.5 * asp, 0.5));
  // screen coordinate ([0, 1] range)
  vec2 sc = gl_FragCoord.xy / u_resolution;
  // discard fragments outside the radius
  if (radius < length(uv)) {
      discard;
  }
  // set the fragment color
  frag_color = vec4(sc.x, sc.y, 1. - sc.x, 1.);
}

