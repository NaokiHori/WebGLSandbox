import { VertexBufferObject } from "../vertexBufferObject";
import { IndexBufferObject } from "../indexBufferObject";
import { setupStaticallyDrawnData } from "./setupStaticallyDrawnData";

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
}): {
  vertexBufferObject: VertexBufferObject;
  indexBufferObject: IndexBufferObject;
} {
  const positions = [
    [-aspectRatio, -1],
    [+aspectRatio, -1],
    [-aspectRatio, +1],
    [+aspectRatio, +1],
  ];
  const indices = [0, 1, 2, 1, 3, 2];
  const vbo: VertexBufferObject = setupStaticallyDrawnData({
    gl,
    program,
    attributeName,
    numberOfVertices: positions.length,
    numberOfItemsForEachVertex: "xy".length,
    data: new Float32Array(positions.flat()),
  });
  const ibo = new IndexBufferObject({
    gl,
    size: indices.length,
    usage: gl.STATIC_DRAW,
  });
  ibo.bindAndExecute({
    gl,
    callback: (boundBuffer: IndexBufferObject) => {
      boundBuffer.updateData({ gl, data: new Int16Array(indices) });
    },
  });
  return { vertexBufferObject: vbo, indexBufferObject: ibo };
}
