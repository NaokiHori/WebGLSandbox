precision mediump float;

uniform vec2 u_scale;

varying vec2 v_position;

void main(void) {
  float radius = 1.;
  if (radius < length(v_position)) {
    gl_FragColor = vec4(0., 0., 0., 1.);
  } else {
    gl_FragColor = vec4(0.5 + 0.5 * v_position.x, 0.5 + 0.5 * v_position.y, 0.5 - 0.5 * v_position.x, 1.);
  }
}

