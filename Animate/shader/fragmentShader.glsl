precision mediump float;

uniform vec2 u_resolution;

float PI = 3.141592653589793238;

float atan2 (
    float x,
    float y
) {
  return 0. == x ? 0. : atan(y, x);
}

void main() {
  // convert to [-1 : +1]
  vec2 circle_coord = 2. * gl_PointCoord - 1.;
  float distance_from_center = length(circle_coord);
  if (1. < distance_from_center) {
    // external
    discard;
  } else {
    // internal
    vec2 center_coord = 2. * gl_FragCoord.xy / u_resolution - 1.;
    float arg = atan2(center_coord.y, center_coord.x);
    float r = 0.5 * (1. + sin(arg + 2. * PI / 3. * 0.));
    float g = 0.5 * (1. + sin(arg + 2. * PI / 3. * 1.));
    float b = 0.5 * (1. + sin(arg + 2. * PI / 3. * 2.));
    gl_FragColor = vec4(r, g, b, 1.);
  }
}
