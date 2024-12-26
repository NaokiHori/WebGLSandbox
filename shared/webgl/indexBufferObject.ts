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
    this.bindAndExecute({
      gl,
      callback: () => {
        gl.bufferData(target, size, usage);
      },
    });
    this._size = size;
    this._usage = usage;
  }

  // bind this buffer to perform operations on it
  // the buffer is unbound before return
  public bindAndExecute({
    gl,
    callback,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    callback: (indexBufferObject: IndexBufferObject) => void;
  }) {
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== null) {
      throw new Error(`Trying to bind a buffer with another buffer bound`);
    }
    const target: GLenum = this.target(gl);
    gl.bindBuffer(target, this._buffer);
    callback(this);
    gl.bindBuffer(target, null);
  }

  public updateData({
    gl,
    data,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    data: Int16Array;
  }) {
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== this._buffer) {
      throw new Error(
        `Trying to push data without a buffer bound or with another buffer bound`,
      );
    }
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
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== this._buffer) {
      throw new Error(
        `Trying to draw data without a buffer bound or with another buffer bound`,
      );
    }
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
