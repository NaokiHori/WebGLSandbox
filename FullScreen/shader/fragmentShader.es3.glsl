#version 300 es

precision mediump float;

uniform vec2 u_scale;

in vec2 v_position;

out vec4 frag_color;

void main(void) {
  float radius = 1.;
  vec2 orig = v_position / u_scale;
  if (radius < length(orig)) {
    frag_color = vec4(0., 0., 0., 1.);
  } else {
    frag_color = vec4(0.5 + 0.5 * orig.x, 0.5 + 0.5 * orig.y, 0.5 - 0.5 * orig.x, 1.);
  }
}

