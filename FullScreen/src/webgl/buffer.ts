export function initBuffer(
  attr: GLint,
  gl: WebGLRenderingContext,
): WebGLBuffer {
  const buffer: WebGLBuffer | null = gl.createBuffer();
  if (null === buffer) {
    throw new Error("createBuffer failed");
  }
  // link buffer with one of the attributes
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return buffer;
}
