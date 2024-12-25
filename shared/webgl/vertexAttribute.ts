import { VertexBufferObject } from "./vertexBufferObject";

export class VertexAttribute {
  private _attributeName: string;

  public constructor({
    gl,
    program,
    attributeName,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    program: WebGLProgram;
    attributeName: string;
  }) {
    const attributeIndex: GLuint = getAttributeIndex(
      gl,
      program,
      attributeName,
    );
    // NOTE: enable on creating it
    gl.enableVertexAttribArray(attributeIndex);
    this._attributeName = attributeName;
  }

  public bindWithArrayBuffer({
    gl,
    program,
    size,
    vertexBufferObject,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    program: WebGLProgram;
    size: GLint;
    vertexBufferObject: VertexBufferObject;
  }) {
    if (1 !== size && 2 !== size && 3 !== size && 4 !== size) {
      throw new Error(
        `The number of components per vertex attribute must be 1, 2, 3, or 4, received: ${size.toString()}`,
      );
    }
    // check if the buffer is currently bound
    if (
      (gl.getParameter(gl.ARRAY_BUFFER_BINDING) as WebGLBuffer) !==
      vertexBufferObject.buffer
    ) {
      throw new Error(`Given array buffer is not currently bound`);
    }
    const attributeName: string = this._attributeName;
    // TODO: for now the data is assumed to be a Float32Array buffer
    const type: GLenum = gl.FLOAT;
    // TODO: for type = gl.FLOAT, this parameter has no effect
    const normalized = false;
    // TODO: assuming the data is tightly packed
    const stride: GLsizei = 0;
    // TODO: assuming the buffer points to the first item
    const offset: GLintptr = 0;
    gl.vertexAttribPointer(
      getAttributeIndex(gl, program, attributeName),
      size,
      type,
      normalized,
      stride,
      offset,
    );
  }

  public get attributeName(): string {
    return this._attributeName;
  }
}

function getAttributeIndex(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  program: WebGLProgram,
  attributeName: string,
): GLuint {
  const attributeIndex: GLint = gl.getAttribLocation(program, attributeName);
  if (-1 === attributeIndex) {
    throw new Error(`Attribute ${attributeName} is not found`);
  }
  return attributeIndex;
}
