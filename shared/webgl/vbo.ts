import { WebGLContext } from "./context";

export interface VBOConfig {
  attributeName: string;
  stride: GLint;
  usage: GLenum;
}

export function initVBO(
  gl: WebGLContext,
  program: WebGLProgram,
  vboConfig: VBOConfig,
  values: Float32Array,
) {
  const attributeIndex: GLint = gl.getAttribLocation(
    program,
    vboConfig.attributeName,
  );
  const vbo: WebGLBuffer | null = gl.createBuffer();
  if (null === vbo) {
    throw new Error("createBuffer failed");
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, values, vboConfig.usage);
  // link buffer and attribute "a_position"
  gl.enableVertexAttribArray(attributeIndex);
  gl.vertexAttribPointer(
    attributeIndex,
    vboConfig.stride,
    gl.FLOAT,
    false,
    0,
    0,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}
