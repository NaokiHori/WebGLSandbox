import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { setupRectangleDomain } from "../../shared/webgl/helperFunctions/setupRectangleDomain";
import { setUniform } from "../../shared/webgl/uniform";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import vertexShaderSource2 from "../shader/vertexShader.es3.glsl?raw";
import fragmentShaderSource2 from "../shader/fragmentShader.es3.glsl?raw";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _positionsVertexBufferObject: VertexBufferObject;

  public constructor(canvas: HTMLCanvasElement) {
    // prepare a context
    const gl: WebGLContext = getContext(
      canvas,
      { preserveDrawingBuffer: false },
      true,
    );
    // both WebGL1 and 2 are handled for this page
    // compiler a shader program using the shader sources
    //   which are loaded from the corresponding files
    const isGL2: boolean = gl instanceof WebGL2RenderingContext;
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource: isGL2 ? vertexShaderSource2 : vertexShaderSource,
      fragmentShaderSource: isGL2
        ? fragmentShaderSource2
        : fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    // prepare a rectangle domain with unitary aspect ratio
    const {
      vertexBufferObject: positionsVertexBufferObject,
    }: { vertexBufferObject: VertexBufferObject } = setupRectangleDomain({
      gl,
      program,
      attributeName: "a_position",
      aspectRatio: 1,
    });
    // keep all information which are needed later
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._positionsVertexBufferObject = positionsVertexBufferObject;
  }

  // adjust scale factors such that a circle fits the size of the canvas
  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const scale = (function computeScale() {
      const aspectRatio: number = w / h;
      return aspectRatio < 1 ? [1, 1 * aspectRatio] : [1 / aspectRatio, 1];
    })();
    gl.viewport(0, 0, w, h);
    setUniform({
      gl,
      program,
      dataType: "FLOAT32",
      uniformName: "u_scale",
      data: scale,
    });
  }

  public draw() {
    const gl: WebGLContext = this._gl;
    const vbo: VertexBufferObject = this._positionsVertexBufferObject;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // the vertex data is unchanged, and thus just a draw call is invoked;
    //   namely no data transfer is needed
    vbo.draw({ gl, mode: gl.TRIANGLE_STRIP });
  }
}
