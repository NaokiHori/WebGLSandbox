precision mediump float;

attribute vec2 a_position;
uniform vec2 u_resolution;

uniform float u_pointsize;

void main() {
  gl_PointSize = u_pointsize;
  // convert pixel coordinates to clip space [-1 : +1]
  vec2 clip_space = 2. * (a_position / u_resolution) - 1.;
  gl_Position = vec4(clip_space, 0., 1.);
}
