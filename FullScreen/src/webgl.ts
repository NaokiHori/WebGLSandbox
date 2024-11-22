import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO, VBOConfig } from "../../shared/webgl/vbo";
import { initResizeEvent } from "./webgl/resizeEvent";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import vertexShaderSource2 from "../shader/vertexShader.es3.glsl?raw";
import fragmentShaderSource2 from "../shader/fragmentShader.es3.glsl?raw";

// prepare two triangles filling the entire screen
const N_VERTICES = 4;
function initPositions(): Float32Array {
  const positions = new Float32Array(N_VERTICES * 2);
  positions[0] = -1;
  positions[1] = -1;
  positions[2] = +1;
  positions[3] = -1;
  positions[4] = -1;
  positions[5] = +1;
  positions[6] = +1;
  positions[7] = +1;
  return positions;
}

export class WebGLObjects {
  gl: WebGLContext;
  program: WebGLProgram;
  handleResizeEvent: (canvas: HTMLCanvasElement) => void;

  constructor(canvas: HTMLCanvasElement) {
    const gl: WebGLContext = getContext(canvas);
    const isGL2: boolean = gl instanceof WebGL2RenderingContext;
    const program = initProgram(
      gl,
      isGL2 ? vertexShaderSource2 : vertexShaderSource,
      isGL2 ? fragmentShaderSource2 : fragmentShaderSource,
    );
    const handleResizeEvent = initResizeEvent(gl, program);
    const positions = initPositions();
    const vboConfig = {
      attributeName: "a_position",
      stride: "xy".length,
      usage: gl.STATIC_DRAW,
    } satisfies VBOConfig;
    initVBO(gl, program, vboConfig, positions);
    this.gl = gl;
    this.program = program;
    this.handleResizeEvent = handleResizeEvent;
  }

  public draw() {
    const gl: WebGLContext = this.gl;
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, N_VERTICES);
  }
}
