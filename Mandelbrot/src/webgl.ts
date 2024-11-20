import { getContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initBuffer } from "./webgl/buffer";
import { initResizeEvent } from "./webgl/resizeEvent";
import { initInputEvent } from "./webgl/inputEvent";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

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
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  handleResizeEvent: (canvas: HTMLCanvasElement) => void;
  handleInputEvent: (refPoint: [number, number]) => void;
  positions: Float32Array;

  constructor(canvas: HTMLCanvasElement) {
    const gl = getContext(canvas);
    const program = initProgram(gl, vertexShaderSource, fragmentShaderSource);
    const buffer = initBuffer(gl.getAttribLocation(program, "a_position"), gl);
    const handleResizeEvent = initResizeEvent(gl, program);
    const handleInputEvent = initInputEvent(gl, program);
    const positions = initPositions();
    // since positions do not change, send data in this constructor
    // we do not need to repeat the procedure in the draw call below
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.gl = gl;
    this.program = program;
    this.buffer = buffer;
    this.handleResizeEvent = handleResizeEvent;
    this.handleInputEvent = handleInputEvent;
    this.positions = positions;
  }

  public draw() {
    const gl: WebGLRenderingContext = this.gl;
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, N_VERTICES);
  }
}
