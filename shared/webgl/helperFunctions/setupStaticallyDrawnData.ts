import { VertexBufferObject } from "../vertexBufferObject";
import { VertexAttribute } from "../vertexAttribute";

// do the following at once
// - create and allocate vbo
// - create attribute
// - bind them
// - push data (because the vertex information will not be altered)
export function setupStaticallyDrawnData({
  gl,
  program,
  attributeName,
  numberOfVertices,
  numberOfItemsForEachVertex,
  data,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  attributeName: string;
  numberOfVertices: number;
  numberOfItemsForEachVertex: number;
  // TODO: for now assuming float32 buffer
  data: Float32Array;
}): VertexBufferObject {
  const vbo = new VertexBufferObject({
    gl,
    numberOfVertices,
    numberOfItemsForEachVertex,
    usage: gl.STATIC_DRAW,
  });
  const attribute = new VertexAttribute({
    gl,
    program,
    attributeName,
  });
  vbo.bind({ gl });
  attribute.bindWithArrayBuffer({
    gl,
    program,
    size: numberOfItemsForEachVertex,
    vertexBufferObject: vbo,
  });
  vbo.updateData({ gl, data });
  vbo.unbind({ gl });
  return vbo;
}
