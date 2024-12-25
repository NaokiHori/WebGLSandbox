export class IndexBufferObject {
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
    this._buffer = buffer;
    this.bind({ gl });
    gl.bufferData(target, size, usage);
    this.unbind({ gl });
    this._size = size;
    this._usage = usage;
  }

  public bind({ gl }: { gl: WebGLRenderingContext | WebGL2RenderingContext }) {
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== null) {
      throw new Error(`Trying to bind a buffer with another buffer bound`);
    }
    const target: GLenum = this.target(gl);
    gl.bindBuffer(target, this._buffer);
  }

  public unbind({
    gl,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
  }) {
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== this._buffer) {
      throw new Error(`Trying to unbind a buffer which is not bound`);
    }
    const target: GLenum = this.target(gl);
    gl.bindBuffer(target, null);
  }

  public updateData({
    gl,
    data,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    data: Int16Array;
  }) {
    const target: GLenum = this.target(gl);
    const size: GLsizeiptr = this._size;
    const usage: GLenum = this._usage;
    if (size !== data.length) {
      throw new Error(
        `Allocated size (${size.toString()}) does not match with the source data size: ${data.length.toString()}`,
      );
    }
    gl.bufferData(target, data, usage);
  }

  public draw({
    gl,
    mode,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    mode: GLenum;
  }) {
    const size: GLsizeiptr = this._size;
    gl.drawElements(mode, size, gl.UNSIGNED_SHORT, 0);
  }
}

function getCurrentlyBoundBuffer(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): WebGLBuffer | null {
  // NOTE: gl.getParameter inherently returns any-typed variable
  return gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) as WebGLBuffer | null;
}
