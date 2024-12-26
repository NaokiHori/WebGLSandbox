export class VertexBufferObject {
  private _buffer: WebGLBuffer;
  private _numberOfVertices: number;
  private _numberOfItemsForEachVertex: number;

  public constructor({
    gl,
    numberOfVertices,
    numberOfItemsForEachVertex,
    usage,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    numberOfVertices: number;
    numberOfItemsForEachVertex: number;
    usage: GLenum;
  }) {
    const target: GLenum = this.target(gl);
    const buffer: WebGLBuffer = gl.createBuffer();
    this._buffer = buffer;
    // TODO: assuming Float32Array buffer
    const size: GLsizeiptr =
      Float32Array.BYTES_PER_ELEMENT *
      numberOfVertices *
      numberOfItemsForEachVertex;
    this.bindAndExecute({
      gl,
      callback: () => {
        gl.bufferData(target, size, usage);
      },
    });
    this._numberOfVertices = numberOfVertices;
    this._numberOfItemsForEachVertex = numberOfItemsForEachVertex;
  }

  public target(gl: WebGLRenderingContext | WebGL2RenderingContext): GLenum {
    return gl.ARRAY_BUFFER;
  }

  // bind this buffer to perform operations on it
  // the buffer is unbound before return
  public bindAndExecute({
    gl,
    callback,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    callback: (vertexBufferObject: VertexBufferObject) => void;
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
    data: Float32Array;
  }) {
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== this._buffer) {
      throw new Error(
        `Trying to push data without a buffer bound or with another buffer bound`,
      );
    }
    const expectedLength: number =
      this._numberOfVertices * this._numberOfItemsForEachVertex;
    if (data.length !== expectedLength) {
      throw new Error(
        `data.length = ${data.length.toString()}, which does not agree with an expected value: ${expectedLength.toString()}`,
      );
    }
    const target: GLenum = this.target(gl);
    gl.bufferSubData(target, 0, data);
  }

  public draw({
    gl,
    mode,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    mode: GLenum;
  }) {
    const numberOfVertices: number = this._numberOfVertices;
    gl.drawArrays(mode, 0, numberOfVertices);
  }

  public get buffer(): WebGLBuffer {
    return this._buffer;
  }

  public get numberOfItemsForEachVertex(): number {
    return this._numberOfItemsForEachVertex;
  }
}

function getCurrentlyBoundBuffer(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): WebGLBuffer | null {
  // NOTE: gl.getParameter inherently returns any-typed variable
  return gl.getParameter(gl.ARRAY_BUFFER_BINDING) as WebGLBuffer | null;
}
