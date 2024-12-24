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

export class IndexBufferObject {
  private _gl: WebGLRenderingContext | WebGL2RenderingContext;
  private _buffer: WebGLBuffer;
  private _size: GLsizeiptr;
  private _usage: GLenum;

  private target(gl: WebGLRenderingContext | WebGL2RenderingContext): GLenum {
    return gl.ELEMENT_ARRAY_BUFFER;
  }

  public constructor({
    gl,
    size,
    usage,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    size: GLsizeiptr;
    usage: GLenum;
  }) {
    const target: GLenum = this.target(gl);
    const buffer: WebGLBuffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, size, usage);
    gl.bindBuffer(target, null);
    this._gl = gl;
    this._buffer = buffer;
    this._size = size;
    this._usage = usage;
  }

  public copyIntoDataStore({ srcData }: { srcData: Int16Array }) {
    const gl: WebGLRenderingContext | WebGL2RenderingContext = this._gl;
    const target: GLenum = this.target(gl);
    const buffer: WebGLBuffer = this._buffer;
    const size: GLsizeiptr = this._size;
    const usage: GLenum = this._usage;
    if (size !== srcData.length) {
      throw new Error(
        `Allocated size (${size.toString()}) does not match with the source data size: ${srcData.length.toString()}`,
      );
    }
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, srcData, usage);
    gl.bindBuffer(target, null);
  }

  public draw({ otherTasks }: { otherTasks: () => void }) {
    const gl: WebGLRenderingContext | WebGL2RenderingContext = this._gl;
    const target: GLenum = this.target(gl);
    const buffer: WebGLBuffer = this._buffer;
    const size: GLsizeiptr = this._size;
    gl.bindBuffer(target, buffer);
    otherTasks();
    gl.drawElements(gl.TRIANGLES, size, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(target, null);
  }
}
