import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { Texture, TextureTarget } from "../../shared/webgl/texture";
import { setupTextureCoordinates } from "../../shared/webgl/helperFunctions/setupTexture";
import { setupRectangleDomain } from "../../shared/webgl/helperFunctions/setupRectangleDomain";
import { setUniform } from "../../shared/webgl/uniform";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

type TextureParam =
  | WebGL2RenderingContext["LINEAR"]
  | WebGL2RenderingContext["NEAREST"];

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _program: WebGLProgram;
  private _indexBufferObject: IndexBufferObject;
  private _scalarTexture: Texture;
  private _scalarTextureParam: TextureParam;
  private _nScalarField: number;
  private _scalarGridPoints: [number, number];

  public constructor(
    canvas: HTMLCanvasElement,
    nScalarField: number,
    scalarGridPoints: [number, number],
  ) {
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
      transformFeedbackVaryings: [],
    });
    const { indexBufferObject }: { indexBufferObject: IndexBufferObject } =
      setupRectangleDomain({
        gl,
        program,
        attributeName: "a_position",
        aspectRatio: scalarGridPoints[0] / scalarGridPoints[1],
      });
    // create and upload the scalar field as a texture
    const scalarTexture = new Texture({
      gl,
      program,
      target: gl.TEXTURE_2D_ARRAY,
      textureUnit: 0,
    });
    scalarTexture.bindAndExecute({
      gl,
      callback: (boundTexture: Texture) => {
        gl.texStorage3D(
          boundTexture.target,
          1,
          gl.R8,
          scalarGridPoints[0],
          scalarGridPoints[1],
          nScalarField,
        );
      },
    });
    setupTextureCoordinates({
      gl,
      program,
      attributeName: "a_texture_coordinates",
    });
    setUniform({
      gl,
      program,
      dataType: "INT32",
      uniformName: "u_texture",
      data: [0],
    });
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._scalarTexture = scalarTexture;
    this._indexBufferObject = indexBufferObject;
    this._nScalarField = nScalarField;
    this._scalarTextureParam = gl.LINEAR;
    this._scalarGridPoints = scalarGridPoints;
    this.updateTextureParam(gl.LINEAR);
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGL2RenderingContext = this._gl;
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
    setUniform({
      gl,
      program,
      dataType: "FLOAT32",
      uniformName: "u_scale",
      data: scale,
    });
  }

  public handleChangeEvent() {
    const gl: WebGL2RenderingContext = this._gl;
    const scalarTextureParam: TextureParam = this._scalarTextureParam;
    const newScalarTextureParam: TextureParam =
      scalarTextureParam === gl.NEAREST ? gl.LINEAR : gl.NEAREST;
    this.updateTextureParam(newScalarTextureParam);
  }

  public draw(scalarField: Uint8Array) {
    const gl: WebGL2RenderingContext = this._gl;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    const scalarTexture: Texture = this._scalarTexture;
    const nScalarField: number = this._nScalarField;
    const scalarGridPoints: [number, number] = this._scalarGridPoints;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    scalarTexture.bindAndExecute({
      gl,
      callback: (boundTexture: Texture) => {
        const textureTarget: TextureTarget = boundTexture.target;
        gl.generateMipmap(textureTarget);
        gl.texSubImage3D(
          textureTarget,
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
        indexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: IndexBufferObject) => {
            boundBuffer.draw({ gl, mode: gl.TRIANGLES });
          },
        });
      },
    });
  }

  private updateTextureParam(newScalarTextureParam: TextureParam) {
    const gl: WebGL2RenderingContext = this._gl;
    const scalarTexture: Texture = this._scalarTexture;
    scalarTexture.bindAndExecute({
      gl,
      callback: (boundTexture: Texture) => {
        const textureTarget: TextureTarget = boundTexture.target;
        gl.texParameteri(
          textureTarget,
          gl.TEXTURE_MIN_FILTER,
          newScalarTextureParam,
        );
        gl.texParameteri(
          textureTarget,
          gl.TEXTURE_MAG_FILTER,
          newScalarTextureParam,
        );
        gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      },
    });
    this._scalarTextureParam = newScalarTextureParam;
  }
}
