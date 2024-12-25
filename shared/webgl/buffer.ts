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
): WebGLBuffer {
  const vbo: WebGLBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, values, vboConfig.usage);
  const attributeIndex: GLint = gl.getAttribLocation(
    program,
    vboConfig.attributeName,
  );
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
