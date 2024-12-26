#version 300 es

precision highp float;

in float a_input0;
in float a_input1;

out float a_output;

void main(void) {
  a_output = a_input0 + a_input1;
}
