export function getContext(
  canvas: HTMLCanvasElement,
  contextAttributes: { preserveDrawingBuffer: boolean },
  acceptGL: boolean,
): WebGLRenderingContext | WebGL2RenderingContext {
  const gl2: WebGL2RenderingContext | null = canvas.getContext("webgl2", {
    ...contextAttributes,
  });
  if (null !== gl2) {
    console.log("Use WebGL2RenderingContext");
    return gl2;
  }
  console.log("WebGL2RenderingContext is not available");
  if (acceptGL) {
    const gl: WebGLRenderingContext | null = canvas.getContext("webgl", {
      ...contextAttributes,
    });
    if (null !== gl) {
      console.log("Use WebGLRenderingContext");
      return gl;
    }
  }
  throw new Error(
    `Failed to fetch WebGL context (acceptGL: ${acceptGL.toString()})`,
  );
}
