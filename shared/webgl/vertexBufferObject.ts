export class VertexBufferObject {
  private _buffer: WebGLBuffer;
  private _numberOfVertices: number;
  private _numberOfItemsForEachVertex: number;

  private target(gl: WebGLRenderingContext | WebGL2RenderingContext): GLenum {
    return gl.ARRAY_BUFFER;
  }

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
    this.bind(gl);
    gl.bufferData(target, size, usage);
    this.unbind(gl);
    this._numberOfVertices = numberOfVertices;
    this._numberOfItemsForEachVertex = numberOfItemsForEachVertex;
  }

  public bind(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== null) {
      throw new Error(`Trying to bind a buffer with another buffer bound`);
    }
    const target: GLenum = this.target(gl);
    gl.bindBuffer(target, this._buffer);
  }

  public unbind(gl: WebGLRenderingContext | WebGL2RenderingContext) {
    const currentlyBoundBuffer: WebGLBuffer | null =
      getCurrentlyBoundBuffer(gl);
    if (currentlyBoundBuffer !== this._buffer) {
      throw new Error(`Trying to unbind a buffer which is not bound`);
    }
    const target: GLenum = this.target(gl);
    gl.bindBuffer(target, null);
  }

  public updateData(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    data: Float32Array,
  ) {
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

  public draw(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    mode: GLenum,
  ) {
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
