import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { Program } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { setupRectangleDomain } from "../../shared/webgl/helperFunctions/setupRectangleDomain";
import { setUniform } from "../../shared/webgl/uniform";
import { ClampedValue } from "../../shared/util/clampedValue";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _program: Program;
  private _indexBufferObject: IndexBufferObject;

  constructor(canvas: HTMLCanvasElement, domainSize: ClampedValue) {
    const gl: WebGL2RenderingContext = getWebGL2RenderingContext({
      canvas,
      contextAttributes: {
        preserveDrawingBuffer: true,
      },
    });
    const program = new Program({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    const indexBufferObject: IndexBufferObject = program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        const {
          indexBufferObject: indexBufferObject,
        }: { indexBufferObject: IndexBufferObject } = setupRectangleDomain({
          gl,
          program: webGLProgram,
          attributeName: "a_position",
          aspectRatio: 1,
        });
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "FLOAT32",
          uniformName: "u_domain_size",
          data: [domainSize.get()],
        });
        return indexBufferObject;
      },
    });
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._indexBufferObject = indexBufferObject;
  }

  public draw(orig: [number, number], ref: [number, number]) {
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "FLOAT32",
          uniformName: "u_orig",
          data: orig,
        });
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "FLOAT32",
          uniformName: "u_ref",
          data: ref,
        });
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        indexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: IndexBufferObject) => {
            boundBuffer.draw({ gl, mode: gl.TRIANGLES });
          },
        });
      },
    });
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const w: number = canvas.width;
    const h: number = canvas.height;
    program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        gl.viewport(0, 0, w, h);
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "FLOAT32",
          uniformName: "u_resolution",
          data: [w, h],
        });
      },
    });
  }

  public handleMoveEvent(domainSize: ClampedValue) {
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "FLOAT32",
          uniformName: "u_domain_size",
          data: [domainSize.get()],
        });
      },
    });
  }

  public getPixelData(): {
    width: number;
    height: number;
    pixelData: Uint8Array;
  } {
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const rgbaData = new Uint8Array(width * height * "rgba".length);
    const rgbData = new Uint8Array(width * height * "rgb".length);
    program.use({
      gl,
      callback: () => {
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, rgbaData);
        for (let n = 0; n < width * height; n += 1) {
          rgbData[3 * n + 0] = rgbaData[4 * n + 0];
          rgbData[3 * n + 1] = rgbaData[4 * n + 1];
          rgbData[3 * n + 2] = rgbaData[4 * n + 2];
        }
      },
    });
    return { width, height, pixelData: new Uint8Array(rgbData) };
  }
}
