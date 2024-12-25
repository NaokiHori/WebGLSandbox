import { setupStaticallyDrawnData } from "./setupStaticallyDrawnData";

// specify how a texture is attached
export function setupTextureCoordinates({
  gl,
  program,
  attributeName,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  attributeName: string;
}) {
  const textureCoordinates = [
    [0, 1],
    [1, 1],
    [0, 0],
    [1, 0],
  ];
  const numberOfVertices = textureCoordinates.length;
  const numberOfItemsForEachVertex = "xy".length;
  setupStaticallyDrawnData({
    gl,
    program,
    attributeName,
    numberOfVertices,
    numberOfItemsForEachVertex,
    data: new Float32Array(textureCoordinates.flat()),
  });
}
