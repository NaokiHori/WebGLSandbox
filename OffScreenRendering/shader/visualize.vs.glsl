#version 300 es

precision mediump float;

uniform vec2 u_scale;

in vec2 a_position;

out vec2 v_texture_coordinates;

const vec2 texture_coordinates[4] = vec2[](
    vec2(0., 0.),
    vec2(1., 0.),
    vec2(0., 1.),
    vec2(1., 1.)
);

void main(void) {
  v_texture_coordinates = texture_coordinates[gl_VertexID];
  gl_Position = vec4(a_position * u_scale, 0., 1.);
}

