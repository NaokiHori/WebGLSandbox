import {
  getWebGLRenderingContext,
  getWebGL2RenderingContext,
  isWebGL2RenderingContext,
} from "../../shared/webgl/context";
import { Program } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { setupRectangleDomain } from "../../shared/webgl/helperFunctions/setupRectangleDomain";
import { setUniform } from "../../shared/webgl/uniform";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import vertexShaderSource2 from "../shader/vertexShader.es3.glsl?raw";
import fragmentShaderSource2 from "../shader/fragmentShader.es3.glsl?raw";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLRenderingContext | WebGL2RenderingContext;
  private _program: Program;
  private _indexBufferObject: IndexBufferObject;

  public constructor(canvas: HTMLCanvasElement) {
    // prepare a context
    const gl: WebGLRenderingContext | WebGL2RenderingContext =
      Math.random() < 0.5
        ? getWebGLRenderingContext({
            canvas,
            contextAttributes: { preserveDrawingBuffer: false },
          })
        : getWebGL2RenderingContext({
            canvas,
            contextAttributes: { preserveDrawingBuffer: false },
          });
    // both WebGL1 and 2 are handled for this page
    // compiler a shader program using the shader sources
    //   which are loaded from the corresponding files
    const isGL2 = isWebGL2RenderingContext(gl);
    const program = new Program({
      gl,
      vertexShaderSource: isGL2 ? vertexShaderSource2 : vertexShaderSource,
      fragmentShaderSource: isGL2
        ? fragmentShaderSource2
        : fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    // prepare a rectangle domain with unitary aspect ratio
    const {
      indexBufferObject: indexBufferObject,
    }: { indexBufferObject: IndexBufferObject } = program.use<{
      indexBufferObject: IndexBufferObject;
    }>({
      gl,
      callback: (webGLProgram: WebGLProgram) =>
        setupRectangleDomain({
          gl,
          program: webGLProgram,
          attributeName: "a_position",
          aspectRatio: 1,
        }),
    });
    // keep all information which are needed later
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._indexBufferObject = indexBufferObject;
  }

  // adjust scale factors such that a circle fits the size of the canvas
  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLRenderingContext | WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const scale: [number, number] = (function computeScale() {
      const aspectRatio: number = w / h;
      return aspectRatio < 1 ? [1, 1 * aspectRatio] : [1 / aspectRatio, 1];
    })();
    program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        gl.viewport(0, 0, w, h);
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "FLOAT32",
          uniformName: "u_scale",
          data: scale,
        });
      },
    });
  }

  public draw() {
    const gl: WebGLRenderingContext | WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    program.use({
      gl,
      callback: () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // the vertex data is unchanged, and thus no data transfer is needed
        // just a draw call is invoked
        indexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: IndexBufferObject) => {
            boundBuffer.draw({ gl, mode: gl.TRIANGLES });
          },
        });
      },
    });
  }
}
