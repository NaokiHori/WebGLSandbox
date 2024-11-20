import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO, initIBO } from "../../shared/webgl/buffer";
import { ClampedValue } from "./clampedValue";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

// prepare two triangles filling the entire screen
function initVertices(): { positions: Float32Array; indexBuffer: Int16Array } {
  const positions = [-1, -1, +1, -1, -1, +1, +1, +1];
  const indexBuffer = [0, 1, 2, 1, 3, 2];
  return {
    positions: new Float32Array(positions),
    indexBuffer: new Int16Array(indexBuffer),
  };
}

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _indexBufferObject: { nitems: number; buffer: WebGLBuffer };

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
    const { positions, indexBuffer } = initVertices();
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
    gl.uniform1f(
      gl.getUniformLocation(program, "u_domain_size"),
      domainSize.get(),
    );
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._indexBufferObject = {
      nitems: indexBuffer.length,
      buffer: initIBO(gl, indexBuffer),
    };
  }

  public draw(orig: [number, number], ref: [number, number]) {
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    gl.uniform2f(gl.getUniformLocation(program, "u_orig"), orig[0], orig[1]);
    gl.uniform2f(gl.getUniformLocation(program, "u_ref"), ref[0], ref[1]);
    const indexBufferObject = this._indexBufferObject;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject.buffer);
    gl.drawElements(
      gl.TRIANGLES,
      indexBufferObject.nitems,
      gl.UNSIGNED_SHORT,
      0,
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.flush();
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
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, rgbaData);
    const rgbData = new Array<number>();
    for (const [index, element] of rgbaData.entries()) {
      if (index % "rgba".length != "rgba".length - 1) {
        rgbData.push(element);
      }
    }
    return { width, height, pixelData: new Uint8Array(rgbData) };
  }
}
