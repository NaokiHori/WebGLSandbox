import { getContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO } from "../../shared/webgl/buffer";
import { Matrix44 } from "../../shared/linearAlgebra/matrix44";
import { Vector3 } from "../../shared/linearAlgebra/vector3";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

function getCanvasAspectRatio(canvas: HTMLCanvasElement): number {
  return canvas.width / canvas.height;
}

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _canvasAspectRatio: number;
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _aPosition1: WebGLBuffer;
  private _aPosition2: WebGLBuffer;
  private _transformFeedback: WebGLTransformFeedback;
  private _drawCntr: number;

  public constructor(
    canvas: HTMLCanvasElement,
    positions: Float32Array,
    colors: Float32Array,
  ) {
    const gl: WebGL2RenderingContext = getContext(
      canvas,
      { preserveDrawingBuffer: false },
      false,
    ) as WebGL2RenderingContext;
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: ["a_position_new"],
    });
    const transformFeedback = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    const positionAttributeName = "a_position_old";
    const aPosition1: WebGLBuffer = initVBO(
      gl,
      program,
      {
        attributeName: positionAttributeName,
        stride: "xyz".length,
        usage: gl.STREAM_COPY,
      },
      positions,
    );
    const aPosition2: WebGLBuffer = initVBO(
      gl,
      program,
      {
        attributeName: positionAttributeName,
        stride: "xyz".length,
        usage: gl.STREAM_COPY,
      },
      positions,
    );
    initVBO(
      gl,
      program,
      {
        attributeName: "a_color",
        stride: "rgb".length,
        usage: gl.STATIC_DRAW,
      },
      colors,
    );
    //
    this._canvas = canvas;
    this._canvasAspectRatio = getCanvasAspectRatio(canvas);
    this._gl = gl;
    this._program = program;
    this._aPosition1 = aPosition1;
    this._aPosition2 = aPosition2;
    this._transformFeedback = transformFeedback;
    this._drawCntr = 0;
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGL2RenderingContext = this._gl;
    const w: number = canvas.width;
    const h: number = canvas.height;
    gl.viewport(0, 0, w, h);
    this._canvasAspectRatio = getCanvasAspectRatio(canvas);
  }

  public draw(nitems: number, rotationMatrix: Matrix44) {
    const gl: WebGL2RenderingContext = this._gl;
    const program: WebGLProgram = this._program;
    const transformFeedback: WebGLTransformFeedback = this._transformFeedback;
    const buffer1: WebGLBuffer =
      0 === this._drawCntr % 2 ? this._aPosition1 : this._aPosition2;
    const buffer2: WebGLBuffer =
      0 === this._drawCntr % 2 ? this._aPosition2 : this._aPosition1;
    const canvasAspectRatio = this._canvasAspectRatio;
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    //
    const modelMatrix = rotationMatrix;
    const cameraPosition = new Vector3({
      x: 0,
      y: 0,
      z: 6.5,
    });
    const viewMatrix: Matrix44 = new Matrix44({
      type: "translate",
      offset: cameraPosition.multiply(-1),
    });
    const perspectiveMatrix = new Matrix44({
      type: "perspective",
      fieldOfView: (1 / 256) * Math.PI,
      aspectRatio: canvasAspectRatio,
      near: cameraPosition.norm(),
      far: cameraPosition.norm() * 2,
    });
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "u_mvp_matrix"),
      false,
      new Float32Array(
        perspectiveMatrix
          .matmul(viewMatrix)
          .matmul(modelMatrix)
          .transpose()
          .flat(),
      ),
    );
    //
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.vertexAttribPointer(
      gl.getAttribLocation(program, "a_position_old"),
      "xyz".length,
      gl.FLOAT,
      false,
      0,
      0,
    );
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer2);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, nitems);
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    this._drawCntr += 1;
  }
}