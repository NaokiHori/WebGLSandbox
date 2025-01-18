#version 300 es

precision mediump float;

// dummy attribute to suppress warning
// contains identical number of items to the positions variable below
in vec2 a_position;

// pre-defined positions of the full-screen triangle
const vec2 positions[3] = vec2[](
  vec2(-1., -1.),
  vec2(3., -1.),
  vec2(-1., 3.)
);

void main(void) {
  gl_Position = vec4(0. * a_position + positions[gl_VertexID], 0., 1.);
}

