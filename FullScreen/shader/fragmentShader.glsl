precision mediump float;

uniform vec2 u_resolution;

void main() {
  float asp = u_resolution.x / u_resolution.y;
  float radius = asp < 1. ? asp : 1.;
  // u: normalized horizontal Euclidean coordinate, [-asp (  left) : +asp (right)]
  // v: normalized vertical   Euclidean coordinate, [-1   (bottom) : +1   (  top)]
  vec2 uv = 2. * (gl_FragCoord.xy / u_resolution.y - vec2(0.5 * asp, 0.5));
  // screen coordinate, [-1 : +1] both in horizontal and vertical directions
  vec2 sc = gl_FragCoord.xy / u_resolution;
  if (radius < length(uv)) {
    discard;
  }
  gl_FragColor = vec4(sc.x, sc.y, 1. - sc.x, 1.);
}

