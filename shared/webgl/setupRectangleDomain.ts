import { VertexBufferObject } from "./vertexBufferObject";
import { VertexAttribute } from "./vertexAttribute";
import { IndexBufferObject } from "./indexBufferObject";

// prepare two triangles, on which we paste the texture
export function setupRectangleDomain({
  gl,
  program,
  attributeName,
  aspectRatio,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  attributeName: string;
  aspectRatio: number;
}): IndexBufferObject {
  const positions = [
    [-aspectRatio, -1],
    [+aspectRatio, -1],
    [-aspectRatio, +1],
    [+aspectRatio, +1],
  ];
  const indices = [0, 1, 2, 1, 3, 2];
  const numberOfVertices: number = positions.length;
  const numberOfItemsForEachVertex: number = "xy".length;
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
  const ibo = new IndexBufferObject({
    gl,
    size: indices.length,
    usage: gl.STATIC_DRAW,
  });
  ibo.bind({ gl });
  ibo.updateData({ gl, data: new Int16Array(indices) });
  ibo.unbind({ gl });
  // push the vertex positions to GPU
  vbo.bind(gl);
  vbo.updateData(gl, new Float32Array(positions.flat()));
  vbo.unbind(gl);
  return ibo;
}
