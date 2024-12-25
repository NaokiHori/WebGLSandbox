import { VertexBufferObject } from "./vertexBufferObject";
import { VertexAttribute } from "./vertexAttribute";

// specify how a texture is attached
export function setupTextureCoordinates({
  gl,
  program,
  attributeName,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  attributeName: string;
}): VertexBufferObject {
  const textureCoordinates = [
    [0, 1],
    [1, 1],
    [0, 0],
    [1, 0],
  ];
  const numberOfVertices = textureCoordinates.length;
  const numberOfItemsForEachVertex = "xy".length;
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
  vbo.bind(gl);
  attribute.bindWithArrayBuffer(gl, program, numberOfItemsForEachVertex, vbo);
  vbo.unbind(gl);
  // push the vertex textureCoordinates to GPU
  vbo.bind(gl);
  vbo.updateData(gl, new Float32Array(textureCoordinates.flat()));
  vbo.unbind(gl);
  return vbo;
}
