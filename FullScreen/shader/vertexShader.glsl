precision mediump float;

uniform vec2 u_scale;

attribute vec2 a_position;

varying vec2 v_position;

void main(void) {
  v_position = a_position / u_scale;
  gl_Position = vec4(a_position, 0., 1.);
}

