import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { VertexAttribute } from "../../shared/webgl/vertexAttribute";
import { TransformFeedback } from "../../shared/webgl/transformFeedback";
import { setupStaticallyDrawnData } from "../../shared/webgl/helperFunctions/setupStaticallyDrawnData";
import { setUniform, setUniformMatrix } from "../../shared/webgl/uniform";
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
  private _positionsVertexAttribute: VertexAttribute;
  private _positionVertexBufferObjects: [
    VertexBufferObject,
    VertexBufferObject,
  ];
  private _transformFeedback: TransformFeedback;
  // specifies the direction of transform feedback
  // true:  from 0 to 1
  // false: from 1 to 0
  private _isForward: boolean;
  private _cameraPositionZ: number;

  public constructor(
    canvas: HTMLCanvasElement,
    numberOfVertices: number,
    positions: Float32Array,
    colors: Float32Array,
    lorenzParams: Float32Array,
    cameraPositionZ: number,
  ) {
    const gl: WebGL2RenderingContext = getWebGL2RenderingContext({
      canvas,
      contextAttributes: {
        preserveDrawingBuffer: true,
      },
    });
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1);
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: ["a_position_new"],
    });
    const transformFeedback = new TransformFeedback({ gl });
    // attribute, which will be accessed by the two buffers alternately
    const positionsVertexAttribute = new VertexAttribute({
      gl,
      program,
      attributeName: "a_position_old",
    });
    // two buffers used as input / output, switched everytime
    const positionVertexBufferObjects: [
      VertexBufferObject,
      VertexBufferObject,
    ] = [
      new VertexBufferObject({
        gl,
        numberOfVertices,
        numberOfItemsForEachVertex: "xyz".length,
        usage: gl.DYNAMIC_COPY,
      }),
      new VertexBufferObject({
        gl,
        numberOfVertices,
        numberOfItemsForEachVertex: "xyz".length,
        usage: gl.DYNAMIC_COPY,
      }),
    ];
    // send the initial positions to the first buffer
    positionVertexBufferObjects[0].bindAndExecute({
      gl,
      callback: (boundBuffer: VertexBufferObject) => {
        positionsVertexAttribute.bindWithArrayBuffer({
          gl,
          program,
          size: boundBuffer.numberOfItemsForEachVertex,
          vertexBufferObject: boundBuffer,
        });
        boundBuffer.updateData({ gl, data: positions });
      },
    });
    setupStaticallyDrawnData({
      gl,
      program,
      attributeName: "a_lorenz_params",
      numberOfVertices,
      numberOfItemsForEachVertex: "srb".length,
      data: lorenzParams,
    });
    setupStaticallyDrawnData({
      gl,
      program,
      attributeName: "a_color",
      numberOfVertices,
      numberOfItemsForEachVertex: "rgb".length,
      data: colors,
    });
    //
    this._canvas = canvas;
    this._canvasAspectRatio = getCanvasAspectRatio(canvas);
    this._gl = gl;
    this._program = program;
    this._positionsVertexAttribute = positionsVertexAttribute;
    this._positionVertexBufferObjects = positionVertexBufferObjects;
    this._transformFeedback = transformFeedback;
    this._isForward = true;
    this._cameraPositionZ = cameraPositionZ;
    this.updateIsPaused(false);
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGL2RenderingContext = this._gl;
    const w: number = canvas.width;
    const h: number = canvas.height;
    gl.viewport(0, 0, w, h);
    this._canvasAspectRatio = getCanvasAspectRatio(canvas);
  }

  public updateCameraPositionZ(cameraPositionZ: number) {
    this._cameraPositionZ = cameraPositionZ;
  }

  public updateIsPaused(isPaused: boolean) {
    const gl: WebGL2RenderingContext = this._gl;
    const program: WebGLProgram = this._program;
    const dt: number = isPaused ? 0 : 0.002;
    setUniform({
      gl,
      program,
      dataType: "FLOAT32",
      uniformName: "u_dt",
      data: [dt],
    });
  }

  public draw(rotationVector: Vector3, rotationAngle: number) {
    const gl: WebGL2RenderingContext = this._gl;
    const program: WebGLProgram = this._program;
    const canvasAspectRatio = this._canvasAspectRatio;
    //
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const rotationMatrix = new Matrix44({
      type: "rotate",
      angle: rotationAngle,
      vector: rotationVector,
    });
    const modelMatrix = rotationMatrix;
    const cameraPosition = new Vector3({
      x: 0,
      y: 0,
      z: this._cameraPositionZ,
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
    setUniformMatrix({
      gl,
      program,
      uniformName: "u_mvp_matrix",
      data: perspectiveMatrix
        .matmul(viewMatrix)
        .matmul(modelMatrix)
        .transpose()
        .flat(),
    });
    //
    const positionsVertexAttribute: VertexAttribute =
      this._positionsVertexAttribute;
    const transformFeedback: TransformFeedback = this._transformFeedback;
    const inputBuffer: VertexBufferObject = this._isForward
      ? this._positionVertexBufferObjects[0]
      : this._positionVertexBufferObjects[1];
    const outputBuffer: VertexBufferObject = this._isForward
      ? this._positionVertexBufferObjects[1]
      : this._positionVertexBufferObjects[0];
    // bind outputBuffer as the transform feedback buffer
    transformFeedback.bindBufferBaseAndExecute({
      gl,
      vertexBufferObject: outputBuffer,
      callback: () => {
        // bind inputBuffer as the array buffer
        inputBuffer.bindAndExecute({
          gl,
          callback: (boundArrayBuffer: VertexBufferObject) => {
            // bind position vertex attribute with the input buffer,
            //   such that this buffer is considered to be
            //   the attribute: "a_position"
            positionsVertexAttribute.bindWithArrayBuffer({
              gl,
              program,
              size: boundArrayBuffer.numberOfItemsForEachVertex,
              vertexBufferObject: boundArrayBuffer,
            });
            // draw call
            gl.beginTransformFeedback(gl.POINTS);
            boundArrayBuffer.draw({ gl, mode: gl.POINTS });
            gl.endTransformFeedback();
          },
        });
      },
    });
    this._isForward = !this._isForward;
  }
}
