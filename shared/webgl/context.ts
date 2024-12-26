function throwWebGLContextFetchException(version: string): never {
  throw new Error(`Failed to fetch WebGL context (WebGL version: ${version})`);
}

export function getWebGLRenderingContext({
  canvas,
  contextAttributes,
}: {
  canvas: HTMLCanvasElement;
  contextAttributes: { preserveDrawingBuffer: boolean };
}): WebGLRenderingContext {
  const gl: WebGLRenderingContext | null = canvas.getContext("webgl", {
    ...contextAttributes,
  });
  if (null !== gl) {
    console.log("Use WebGLRenderingContext");
    return gl;
  }
  throwWebGLContextFetchException("1");
}

export function getWebGL2RenderingContext({
  canvas,
  contextAttributes,
}: {
  canvas: HTMLCanvasElement;
  contextAttributes: { preserveDrawingBuffer: boolean };
}): WebGL2RenderingContext {
  const gl: WebGL2RenderingContext | null = canvas.getContext("webgl2", {
    ...contextAttributes,
  });
  if (null !== gl) {
    console.log("Use WebGL2RenderingContext");
    return gl;
  }
  throwWebGLContextFetchException("2");
}

export function isWebGL2RenderingContext(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): gl is WebGL2RenderingContext {
  return gl instanceof WebGL2RenderingContext;
}
