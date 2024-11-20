import { getContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initBuffer } from "./webgl/buffer";
import { initResizeEvent } from "./webgl/resizeEvent";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

export class WebGLObjects {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  handleResizeEvent: (canvas: HTMLCanvasElement) => void;

  constructor(canvas: HTMLCanvasElement, positions: Float32Array) {
    const gl = getContext(canvas);
    const program = initProgram(gl, vertexShaderSource, fragmentShaderSource);
    const buffer = initBuffer(gl.getAttribLocation(program, "a_position"), gl);
    const handleResizeEvent = initResizeEvent(gl, program);
    // since the buffer is intended to be updated frequently,
    //   we specify gl.DYNAMIC_DRAW
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.gl = gl;
    this.program = program;
    this.buffer = buffer;
    this.handleResizeEvent = handleResizeEvent;
  }

  public draw(nitems: number, positions: Float32Array) {
    const gl: WebGLRenderingContext = this.gl;
    const buffer: WebGLBuffer = this.buffer;
    // send positions for every time
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    gl.drawArrays(gl.POINTS, 0, nitems);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
