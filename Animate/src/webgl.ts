import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO, VBOConfig } from "../../shared/webgl/vbo";
import { initResizeEvent } from "./webgl/resizeEvent";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import vertexShaderSource2 from "../shader/vertexShader.es3.glsl?raw";
import fragmentShaderSource2 from "../shader/fragmentShader.es3.glsl?raw";

export class WebGLObjects {
  gl: WebGLContext;
  program: WebGLProgram;
  handleResizeEvent: (canvas: HTMLCanvasElement) => void;
  positionsVBO: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement, positions: Float32Array) {
    const gl: WebGLContext = getContext(canvas);
    const isGL2: boolean = gl instanceof WebGL2RenderingContext;
    const program = initProgram(
      gl,
      isGL2 ? vertexShaderSource2 : vertexShaderSource,
      isGL2 ? fragmentShaderSource2 : fragmentShaderSource,
    );
    const handleResizeEvent = initResizeEvent(gl, program);
    const vboConfig = {
      attributeName: "a_position",
      stride: "xy".length,
      usage: gl.DYNAMIC_DRAW,
    } satisfies VBOConfig;
    const positionsVBO = initVBO(gl, program, vboConfig, positions);
    this.gl = gl;
    this.program = program;
    this.handleResizeEvent = handleResizeEvent;
    this.positionsVBO = positionsVBO;
  }

  public draw(nitems: number, positions: Float32Array) {
    const gl: WebGLContext = this.gl;
    const positionsVBO: WebGLBuffer = this.positionsVBO;
    // send positions for every time
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    gl.drawArrays(gl.POINTS, 0, nitems);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
