import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { setupStaticallyDrawnData } from "../../shared/webgl/helperFunctions/setupStaticallyDrawnData";

// prepare two triangles, on which we paste the texture
export function setupRectangleDomain({
  gl,
  program,
  attributeName,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  attributeName: string;
}): {
  vertexBufferObject: VertexBufferObject;
  indexBufferObject: IndexBufferObject;
} {
  const positions = [
    [-0.5, -0.5],
    [+0.5, -0.5],
    [-0.5, +0.5],
    [+0.5, +0.5],
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
