import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO } from "../../shared/webgl/buffer";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

// prepare two triangles filling the entire screen
function initPositions(aspectRatio: number): number[][] {
  const positions = new Array<number[]>();
  positions.push([-aspectRatio, -1]);
  positions.push([+aspectRatio, -1]);
  positions.push([-aspectRatio, +1]);
  positions.push([+aspectRatio, +1]);
  return positions;
}

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _scalarTexture: WebGLTexture;
  private _numberOfVertices: number;
  private _scalarWidth: number;
  private _scalarHeight: number;
  private _scalarField: Float32Array;

  public constructor(
    canvas: HTMLCanvasElement,
    scalarWidth: number,
    scalarHeight: number,
    scalarField: Float32Array,
  ) {
    const gl = getContext(
      canvas,
      { preserveDrawingBuffer: false },
      false,
    ) as WebGL2RenderingContext;
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    const positions: number[][] = initPositions(scalarWidth / scalarHeight);
    initVBO(
      gl,
      program,
      {
        attributeName: "a_position",
        stride: "xy".length,
        usage: gl.STATIC_DRAW,
      },
      new Float32Array(positions.flat()),
    );
    // create and upload the scalar field as a texture
    const scalarTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, scalarTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      scalarWidth,
      scalarHeight,
      0,
      gl.RED,
      gl.FLOAT,
      scalarField,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    initVBO(
      gl,
      program,
      {
        attributeName: "a_texture_coordinates",
        stride: "xy".length,
        usage: gl.STATIC_DRAW,
      },
      new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
    );
    gl.uniform1i(gl.getUniformLocation(program, "u_scalar_field"), 0);
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._scalarTexture = scalarTexture;
    this._numberOfVertices = positions.length;
    this._scalarWidth = scalarWidth;
    this._scalarHeight = scalarHeight;
    this._scalarField = scalarField;
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const scalarAspectRatio: number = this._scalarWidth / this._scalarHeight;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const canvasAspectRatio: number = w / h;
    const scale = (function computeScale() {
      return canvasAspectRatio < scalarAspectRatio
        ? [1 / scalarAspectRatio, canvasAspectRatio / scalarAspectRatio]
        : [1 / canvasAspectRatio, 1];
    })();
    gl.viewport(0, 0, w, h);
    gl.uniform2f(gl.getUniformLocation(program, "u_scale"), scale[0], scale[1]);
  }

  public draw() {
    const gl: WebGL2RenderingContext = this._gl;
    const numberOfVertices: number = this._numberOfVertices;
    const scalarTexture: WebGLTexture = this._scalarTexture;
    const scalarWidth: number = this._scalarWidth;
    const scalarHeight: number = this._scalarHeight;
    const scalarField: Float32Array = this._scalarField;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, scalarTexture);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      scalarWidth,
      scalarHeight,
      gl.RED,
      gl.FLOAT,
      scalarField,
    );
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, numberOfVertices);
  }
}
