import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { VertexAttribute } from "../../shared/webgl/vertexAttribute";
import { TransformFeedback } from "../../shared/webgl/transformFeedback";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

export class WebGLObjects {
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _input0VertexAttribute: VertexAttribute;
  private _input1VertexAttribute: VertexAttribute;
  private _input0VertexBufferObject: VertexBufferObject;
  private _input1VertexBufferObject: VertexBufferObject;
  private _outputVertexBufferObject: VertexBufferObject;
  private _transformFeedback: TransformFeedback;

  public constructor(canvas: HTMLCanvasElement, numberOfVertices: number) {
    const gl: WebGL2RenderingContext = getWebGL2RenderingContext({
      canvas,
      contextAttributes: {
        preserveDrawingBuffer: true,
      },
    });
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: ["a_output"],
    });
    const transformFeedback = new TransformFeedback({ gl });
    const input0VertexAttribute = new VertexAttribute({
      gl,
      program,
      attributeName: "a_input0",
    });
    const input1VertexAttribute = new VertexAttribute({
      gl,
      program,
      attributeName: "a_input1",
    });
    const input0VertexBufferObject = new VertexBufferObject({
      gl,
      numberOfVertices,
      numberOfItemsForEachVertex: 1,
      usage: gl.DYNAMIC_COPY,
    });
    const input1VertexBufferObject = new VertexBufferObject({
      gl,
      numberOfVertices,
      numberOfItemsForEachVertex: 1,
      usage: gl.DYNAMIC_COPY,
    });
    const outputVertexBufferObject = new VertexBufferObject({
      gl,
      numberOfVertices,
      numberOfItemsForEachVertex: 1,
      usage: gl.DYNAMIC_COPY,
    });
    //
    this._gl = gl;
    this._program = program;
    this._input0VertexAttribute = input0VertexAttribute;
    this._input1VertexAttribute = input1VertexAttribute;
    this._input0VertexBufferObject = input0VertexBufferObject;
    this._input1VertexBufferObject = input1VertexBufferObject;
    this._outputVertexBufferObject = outputVertexBufferObject;
    this._transformFeedback = transformFeedback;
  }

  public draw(
    nitems: number,
    input0: Float32Array,
    input1: Float32Array,
  ): Float32Array {
    const gl: WebGL2RenderingContext = this._gl;
    const program: WebGLProgram = this._program;
    //
    const input0VertexAttribute: VertexAttribute = this._input0VertexAttribute;
    const input1VertexAttribute: VertexAttribute = this._input1VertexAttribute;
    const transformFeedback: TransformFeedback = this._transformFeedback;
    const input0Buffer: VertexBufferObject = this._input0VertexBufferObject;
    const input1Buffer: VertexBufferObject = this._input1VertexBufferObject;
    const outputBuffer: VertexBufferObject = this._outputVertexBufferObject;
    input0Buffer.bindAndExecute({
      gl,
      callback: (boundArrayBuffer: VertexBufferObject) => {
        boundArrayBuffer.updateData({ gl, data: input0 });
        input0VertexAttribute.bindWithArrayBuffer({
          gl,
          program,
          size: boundArrayBuffer.numberOfItemsForEachVertex,
          vertexBufferObject: boundArrayBuffer,
        });
      },
    });
    input1Buffer.bindAndExecute({
      gl,
      callback: (boundArrayBuffer: VertexBufferObject) => {
        boundArrayBuffer.updateData({ gl, data: input1 });
        input1VertexAttribute.bindWithArrayBuffer({
          gl,
          program,
          size: boundArrayBuffer.numberOfItemsForEachVertex,
          vertexBufferObject: boundArrayBuffer,
        });
      },
    });
    gl.enable(gl.RASTERIZER_DISCARD);
    transformFeedback.bindBufferBaseAndExecute({
      gl,
      vertexBufferObject: outputBuffer,
      callback: () => {
        gl.beginTransformFeedback(gl.POINTS);
        outputBuffer.draw({ gl, mode: gl.POINTS });
        gl.endTransformFeedback();
      },
    });
    gl.disable(gl.RASTERIZER_DISCARD);
    const output = new Float32Array(nitems);
    outputBuffer.bindAndExecute({
      gl,
      callback: (boundArrayBuffer: VertexBufferObject) => {
        gl.getBufferSubData(boundArrayBuffer.target(gl), 0, output);
      },
    });
    return output;
  }
}
