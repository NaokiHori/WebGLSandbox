function initShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type:
    | (WebGLRenderingContext | WebGL2RenderingContext)["FRAGMENT_SHADER"]
    | (WebGLRenderingContext | WebGL2RenderingContext)["VERTEX_SHADER"],
  source: string,
): WebGLShader {
  // creates a shader of the given type
  const shader: WebGLShader | null = gl.createShader(type);
  if (null === shader) {
    throw new Error("gl.createShader failed");
  }
  // compile source
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  // check if shader being successfully compiled
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info: string = gl.getShaderInfoLog(shader) ?? "unknown message";
    gl.deleteShader(shader);
    throw new Error(`gl.compileShader failed: ${info}`);
  }
  return shader;
}

export class Program {
  private _program: WebGLProgram;

  public constructor({
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    transformFeedbackVaryings,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    vertexShaderSource: string;
    fragmentShaderSource: string;
    transformFeedbackVaryings: string[];
  }) {
    const vertexShader: WebGLShader = initShader(
      gl,
      gl.VERTEX_SHADER,
      vertexShaderSource,
    );
    const fragmentShader: WebGLShader = initShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    const program: WebGLProgram = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    if (0 < transformFeedbackVaryings.length) {
      if (gl instanceof WebGLRenderingContext) {
        gl.deleteProgram(program);
        throw new Error("WebGL1 does not support transform feedback");
      }
      gl.transformFeedbackVaryings(
        program,
        transformFeedbackVaryings,
        gl.SEPARATE_ATTRIBS,
      );
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info: string = gl.getProgramInfoLog(program) ?? "unknown message";
      gl.deleteProgram(program);
      throw new Error(`Failed to link program: ${info}`);
    }
    this._program = program;
  }

  public use<T>({
    gl,
    callback,
  }: {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    callback: (program: WebGLProgram) => T;
  }): T {
    gl.useProgram(this._program);
    const resultOfCallback: T = callback(this._program);
    gl.useProgram(null);
    return resultOfCallback;
  }
}
