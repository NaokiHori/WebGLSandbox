import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { VertexAttribute } from "../../shared/webgl/vertexAttribute";
import { setUniform } from "../../shared/webgl/uniform";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _minLength: number;
  private _pointSize: number;
  private _positionsVertexBufferObject: VertexBufferObject;

  public constructor(
    canvas: HTMLCanvasElement,
    numberOfVertices: number,
    numberOfItemsForEachVertex: number,
    minLength: number,
    pointSize: number,
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
    const positionsVertexBufferObject: VertexBufferObject =
      (function initializePositionsVertexBufferObject() {
        const vbo = new VertexBufferObject({
          gl,
          numberOfVertices,
          numberOfItemsForEachVertex,
          usage: gl.DYNAMIC_DRAW,
        });
        const attribute = new VertexAttribute({
          gl,
          program,
          attributeName: "a_position",
        });
        vbo.bind({ gl });
        attribute.bindWithArrayBuffer({
          gl,
          program,
          size: numberOfItemsForEachVertex,
          vertexBufferObject: vbo,
        });
        vbo.unbind({ gl });
        return vbo;
      })();
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._minLength = minLength;
    this._pointSize = pointSize;
    this._positionsVertexBufferObject = positionsVertexBufferObject;
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const minLength: number = this._minLength;
    const pointSize: number = this._pointSize;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const aspectRatio: number = w / h;
    const scale = (function computeScale() {
      // convert one of the axes, from [- minLength : + minLength] to [- 1 : + 1]
      const scale =
        aspectRatio < 1 ? [1, 1 * aspectRatio] : [1 / aspectRatio, 1];
      return [scale[0] / minLength, scale[1] / minLength];
    })();
    const pixelsPerUnitLength = aspectRatio < 1 ? w / minLength : h / minLength;
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
    setUniform({
      gl,
      program,
      dataType: "FLOAT32",
      uniformName: "u_scale",
      data: scale,
    });
    setUniform({
      gl,
      program,
      dataType: "FLOAT32",
      uniformName: "u_point_size",
      data: [pointSizeInPixels],
    });
  }

  public draw(positions: Float32Array) {
    const gl: WebGLContext = this._gl;
    const vbo: VertexBufferObject = this._positionsVertexBufferObject;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    vbo.bind({ gl });
    vbo.updateData({ gl, data: positions });
    vbo.draw({ gl, mode: gl.POINTS });
    vbo.unbind({ gl });
  }
}
