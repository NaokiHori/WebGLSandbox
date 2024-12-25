import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { setupTextureCoordinates } from "../../shared/webgl/setupTexture";
import { setupRectangleDomain } from "../../shared/webgl/setupRectangleDomain";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _indexBufferObject: IndexBufferObject;
  private _scalarTexture: WebGLTexture;
  private _nScalarField: number;
  private _scalarGridPoints: [number, number];

  public constructor(
    canvas: HTMLCanvasElement,
    nScalarField: number,
    scalarGridPoints: [number, number],
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
    const indexBufferObject: IndexBufferObject = setupRectangleDomain({
      gl,
      program,
      attributeName: "a_position",
      aspectRatio: scalarGridPoints[0] / scalarGridPoints[1],
    });
    // create and upload the scalar field as a texture
    const scalarTexture: WebGLTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, scalarTexture);
    gl.texStorage3D(
      gl.TEXTURE_2D_ARRAY,
      1,
      gl.R8,
      scalarGridPoints[0],
      scalarGridPoints[1],
      nScalarField,
    );
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    setupTextureCoordinates({
      gl,
      program,
      attributeName: "a_texture_coordinates",
    });
    gl.uniform1i(gl.getUniformLocation(program, "u_scalar_field"), 0);
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._scalarTexture = scalarTexture;
    this._indexBufferObject = indexBufferObject;
    this._nScalarField = nScalarField;
    this._scalarGridPoints = scalarGridPoints;
    this.updateTextureParam(gl.LINEAR);
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const scalarGridPoints: [number, number] = this._scalarGridPoints;
    const scalarAspectRatio: number = scalarGridPoints[0] / scalarGridPoints[1];
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

  public draw(scalarField: Uint8Array) {
    const gl: WebGL2RenderingContext = this._gl;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    const scalarTexture: WebGLTexture = this._scalarTexture;
    const nScalarField: number = this._nScalarField;
    const scalarGridPoints: [number, number] = this._scalarGridPoints;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, scalarTexture);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    gl.texSubImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,
      0,
      0,
      0,
      scalarGridPoints[0],
      scalarGridPoints[1],
      nScalarField,
      gl.RED,
      gl.UNSIGNED_BYTE,
      scalarField,
    );
    indexBufferObject.bind({ gl });
    indexBufferObject.draw({ gl, mode: gl.TRIANGLES });
    indexBufferObject.unbind({ gl });
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
  }

  private updateTextureParam(newScalarTextureParam: GLint) {
    const gl: WebGL2RenderingContext = this._gl;
    const scalarTexture: WebGLTexture = this._scalarTexture;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, scalarTexture);
    gl.texParameteri(
      gl.TEXTURE_2D_ARRAY,
      gl.TEXTURE_MIN_FILTER,
      newScalarTextureParam,
    );
    gl.texParameteri(
      gl.TEXTURE_2D_ARRAY,
      gl.TEXTURE_MAG_FILTER,
      newScalarTextureParam,
    );
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
  }
}
