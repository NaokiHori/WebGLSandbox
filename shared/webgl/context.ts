export function getContext(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl: WebGLRenderingContext | null = canvas.getContext("webgl");
  if (null === gl) {
    throw new Error("failed to fetch WebGL context");
  }
  return gl;
}
