precision mediump float;

uniform vec2 u_scale;

varying vec2 v_position;

void main(void) {
  float radius = 1.;
  vec2 orig = v_position / u_scale;
  if (radius < length(orig)) {
    gl_FragColor = vec4(0., 0., 0., 1.);
  } else {
    gl_FragColor = vec4(0.5 + 0.5 * orig.x, 0.5 + 0.5 * orig.y, 0.5 - 0.5 * orig.x, 1.);
  }
}

