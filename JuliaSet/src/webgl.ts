import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO } from "../../shared/webgl/buffer";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { ClampedValue } from "../../shared/util/clampedValue";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

// prepare two triangles filling the entire screen
function initVertices(): { positions: Float32Array; indices: Int16Array } {
  const positions = [-1, -1, +1, -1, -1, +1, +1, +1];
  const indices = [0, 1, 2, 1, 3, 2];
  return {
    positions: new Float32Array(positions),
    indices: new Int16Array(indices),
  };
}

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _indexBufferObject: IndexBufferObject;

  constructor(canvas: HTMLCanvasElement, domainSize: ClampedValue) {
    const gl: WebGLContext = getContext(
      canvas,
      { preserveDrawingBuffer: true },
      false,
    );
    const program = initProgram({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    const { positions, indices } = initVertices();
    initVBO(
      gl,
      program,
      {
        attributeName: "a_position",
        stride: "xy".length,
        usage: gl.STATIC_DRAW,
      },
      positions,
    );
    const indexBufferObject = new IndexBufferObject({
      gl,
      size: indices.length,
      usage: gl.STATIC_DRAW,
    });
    indexBufferObject.copyIntoDataStore({ srcData: indices });
    gl.uniform1f(
      gl.getUniformLocation(program, "u_domain_size"),
      domainSize.get(),
    );
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._indexBufferObject = indexBufferObject;
  }

  public draw(orig: [number, number], ref: [number, number]) {
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    gl.uniform2f(gl.getUniformLocation(program, "u_orig"), orig[0], orig[1]);
    gl.uniform2f(gl.getUniformLocation(program, "u_ref"), ref[0], ref[1]);
    indexBufferObject.draw({
      otherTasks: () => {
        /* nothing else to do for this ibo */
      },
    });
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const w: number = canvas.width;
    const h: number = canvas.height;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), w, h);
  }

  public handleMoveEvent(domainSize: ClampedValue) {
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    gl.uniform1f(
      gl.getUniformLocation(program, "u_domain_size"),
      domainSize.get(),
    );
  }

  public getPixelData(): {
    width: number;
    height: number;
    pixelData: Uint8Array;
  } {
    const gl: WebGLContext = this._gl;
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const rgbaData = new Uint8Array(width * height * "rgba".length);
    const rgbData = new Uint8Array(width * height * "rgb".length);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, rgbaData);
    for (let n = 0; n < width * height; n += 1) {
      rgbData[3 * n + 0] = rgbaData[4 * n + 0];
      rgbData[3 * n + 1] = rgbaData[4 * n + 1];
      rgbData[3 * n + 2] = rgbaData[4 * n + 2];
    }
    return { width, height, pixelData: new Uint8Array(rgbData) };
  }
}
