import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO } from "../../shared/webgl/buffer";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import vertexShaderSource2 from "../shader/vertexShader.es3.glsl?raw";
import fragmentShaderSource2 from "../shader/fragmentShader.es3.glsl?raw";

// prepare two triangles filling the entire screen
function initPositions(): number[][] {
  const positions = new Array<number[]>();
  positions.push([-1, -1]);
  positions.push([+1, -1]);
  positions.push([-1, +1]);
  positions.push([+1, +1]);
  return positions;
}

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _numberOfVertices: number;

  public constructor(canvas: HTMLCanvasElement) {
    const gl: WebGLContext = getContext(
      canvas,
      { preserveDrawingBuffer: false },
      true,
    );
    const isGL2: boolean = gl instanceof WebGL2RenderingContext;
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource: isGL2 ? vertexShaderSource2 : vertexShaderSource,
      fragmentShaderSource: isGL2
        ? fragmentShaderSource2
        : fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    const positions: number[][] = initPositions();
    initVBO(
      gl,
      program,
      {
        attributeName: "a_position",
        stride: "xy".length,
        usage: gl.STATIC_DRAW,
      },
      new Float32Array(positions.flat()),
    );
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._numberOfVertices = positions.length;
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const asp: number = w / h;
    const scale = (function computeScale() {
      return asp < 1 ? [1, 1 * asp] : [1 / asp, 1];
    })();
    gl.viewport(0, 0, w, h);
    gl.uniform2f(gl.getUniformLocation(program, "u_scale"), scale[0], scale[1]);
  }

  public draw() {
    const gl: WebGLContext = this._gl;
    const numberOfVertices: number = this._numberOfVertices;
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, numberOfVertices);
  }
}
