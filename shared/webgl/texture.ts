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
  private _target: TextureTarget;
  private _texture: WebGLTexture;
  private _textureUnit: TextureUnit;

  public constructor({
    gl,
    program,
    target,
    textureUnit,
  }: {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;
    target: TextureTarget;
    textureUnit: TextureUnit;
  }) {
    activateTexture(gl, textureUnit);
    setUniform({
      gl,
      program,
      dataType: "INT32",
      uniformName: "u_texture",
      data: [textureUnit],
    });
    const texture: WebGLTexture = gl.createTexture();
    this._target = target;
    this._texture = texture;
    this._textureUnit = textureUnit;
  }

  public bindAndExecute({
    gl,
    callback,
  }: {
    gl: WebGL2RenderingContext;
    callback: (boundTexture: Texture) => void;
  }) {
    const target: TextureTarget = this._target;
    const texture: WebGLTexture = this._texture;
    const textureUnit: TextureUnit = this._textureUnit;
    activateTexture(gl, textureUnit);
    gl.bindTexture(target, texture);
    callback(this);
    gl.bindTexture(target, null);
  }

  public get target(): TextureTarget {
    return this._target;
  }
}
