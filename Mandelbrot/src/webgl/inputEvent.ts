export function initInputEvent(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
): (refPoint: [number, number]) => void {
  return (refPoint: [number, number]): void => {
    gl.uniform2f(
      gl.getUniformLocation(program, "u_ref"),
      refPoint[0],
      refPoint[1],
    );
  };
}
