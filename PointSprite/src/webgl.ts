import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO } from "../../shared/webgl/buffer";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _minLength: number;
  private _pointSize: number;
  private _positionsVBO: WebGLBuffer;

  public constructor(
    canvas: HTMLCanvasElement,
    minLength: number,
    pointSize: number,
    positions: Float32Array,
  ) {
    const gl: WebGLContext = getContext(
      canvas,
      { preserveDrawingBuffer: false },
      false,
    );
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._minLength = minLength;
    this._pointSize = pointSize;
    this._positionsVBO = initVBO(
      gl,
      program,
      {
        attributeName: "a_position",
        stride: "xy".length,
        usage: gl.DYNAMIC_DRAW,
      },
      positions,
    );
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const minLength: number = this._minLength;
    const pointSize: number = this._pointSize;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const asp: number = w / h;
    const scale = (function computeScale() {
      // convert one of the axes, from [- minLength : + minLength] to [- 1 : + 1]
      const scale = asp < 1 ? [1, 1 * asp] : [1 / asp, 1];
      return [scale[0] / minLength, scale[1] / minLength];
    })();
    const pixelsPerUnitLength = asp < 1 ? w / minLength : h / minLength;
    const pointSizeInPixels: number = (function computePointSizeInPixels() {
      const availableRange: Float32Array = gl.getParameter(
        gl.ALIASED_POINT_SIZE_RANGE,
      ) as Float32Array;
      let pointSizeInPixels = pointSize * pixelsPerUnitLength;
      if (pointSizeInPixels < availableRange[0]) {
        console.log(
          `Specified pointSizeInPixels is too small: ${availableRange[0].toString()}`,
        );
        pointSizeInPixels = availableRange[0];
      }
      if (availableRange[1] < pointSizeInPixels) {
        console.log(
          `Specified pointSizeInPixels is too large: ${availableRange[1].toString()}`,
        );
        pointSizeInPixels = availableRange[1];
      }
      return pointSizeInPixels;
    })();
    gl.viewport(0, 0, w, h);
    gl.uniform2f(gl.getUniformLocation(program, "u_scale"), scale[0], scale[1]);
    gl.uniform1f(
      gl.getUniformLocation(program, "u_point_size"),
      pointSizeInPixels,
    );
  }

  public draw(nitems: number, positions: Float32Array) {
    const gl: WebGLContext = this._gl;
    const positionsVBO: WebGLBuffer = this._positionsVBO;
    // send positions for every time
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsVBO);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
    gl.drawArrays(gl.POINTS, 0, nitems);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
