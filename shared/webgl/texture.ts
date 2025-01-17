import { setUniform } from "./uniform";

export type TextureTarget =
  | WebGL2RenderingContext["TEXTURE_2D"]
  | WebGL2RenderingContext["TEXTURE_2D_ARRAY"];

export type TextureUnit = number;

function throwUnsupportedTextureUnitException(textureUnit: TextureUnit): never {
  throw new Error(`Unsupported texture unit: ${textureUnit.toString()}`);
}

function activateTexture(gl: WebGL2RenderingContext, textureUnit: TextureUnit) {
  if (0 === textureUnit) {
    gl.activeTexture(gl.TEXTURE0);
  } else if (1 === textureUnit) {
    gl.activeTexture(gl.TEXTURE1);
  } else {
    throwUnsupportedTextureUnitException(textureUnit);
  }
}

export class Texture {
  private _textureTarget: TextureTarget;
  private _webGLTexture: WebGLTexture;
  private _textureUnit: TextureUnit;

  public constructor({
    gl,
    program,
    textureTarget,
    textureUnit,
    textureName,
  }: {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    textureTarget: TextureTarget;
    textureUnit: TextureUnit;
    textureName: string;
  }) {
    activateTexture(gl, textureUnit);
    setUniform({
      gl,
      program,
      dataType: "INT32",
      uniformName: textureName,
      data: [textureUnit],
    });
    const webGLTexture: WebGLTexture = gl.createTexture();
    this._textureTarget = textureTarget;
    this._webGLTexture = webGLTexture;
    this._textureUnit = textureUnit;
  }

  public bindAndExecute({
    gl,
    callback,
  }: {
    gl: WebGL2RenderingContext;
    callback: (boundTexture: Texture) => void;
  }) {
    const textureTarget: TextureTarget = this._textureTarget;
    const webGLTexture: WebGLTexture = this._webGLTexture;
    const textureUnit: TextureUnit = this._textureUnit;
    activateTexture(gl, textureUnit);
    gl.bindTexture(textureTarget, webGLTexture);
    callback(this);
    gl.bindTexture(textureTarget, null);
  }

  public get textureTarget(): TextureTarget {
    return this._textureTarget;
  }
}
