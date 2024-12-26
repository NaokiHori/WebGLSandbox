import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { setupTextureCoordinates } from "../../shared/webgl/helperFunctions/setupTexture";
import { setupRectangleDomain } from "../../shared/webgl/helperFunctions/setupRectangleDomain";
import { setUniform } from "../../shared/webgl/uniform";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import sampleImage from "../sample.jpeg";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _indexBufferObject: IndexBufferObject;
  private _texture: WebGLTexture;
  private _imageAspectRatio: number;

  private constructor(
    canvas: HTMLCanvasElement,
    gl: WebGLContext,
    program: WebGLProgram,
    texture: WebGLTexture,
    imageWidth: number,
    imageHeight: number,
  ) {
    const imageAspectRatio: number = imageWidth / imageHeight;
    const { indexBufferObject }: { indexBufferObject: IndexBufferObject } =
      setupRectangleDomain({
        gl,
        program,
        attributeName: "a_position",
        aspectRatio: imageAspectRatio,
      });
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._indexBufferObject = indexBufferObject;
    this._texture = texture;
    this._imageAspectRatio = imageAspectRatio;
  }

  public static async setup(canvas: HTMLCanvasElement): Promise<WebGLObjects> {
    return new Promise((resolve: (webGLObjects: WebGLObjects) => void) => {
      const gl: WebGLContext = getContext(
        canvas,
        { preserveDrawingBuffer: false },
        false,
      );
      const program: WebGLProgram = initProgram({
        gl,
        vertexShaderSource,
        fragmentShaderSource,
        transformFeedbackVaryings: [],
      });
      // texture configuration
      gl.activeTexture(gl.TEXTURE0);
      setUniform({
        gl,
        program,
        dataType: "INT32",
        uniformName: "u_texture",
        data: [0],
      });
      const image = new Image();
      const texture: WebGLTexture = gl.createTexture();
      image.src = sampleImage;
      image.addEventListener("load", () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        setupTextureCoordinates({
          gl,
          program,
          attributeName: "a_texture_coordinates",
        });
        const imageWidth = image.width;
        const imageHeight = image.height;
        resolve(
          new WebGLObjects(
            canvas,
            gl,
            program,
            texture,
            imageWidth,
            imageHeight,
          ),
        );
      });
    });
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const imageAspectRatio: number = this._imageAspectRatio;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const canvasAspectRatio: number = w / h;
    const scale = (function computeScale() {
      return canvasAspectRatio < imageAspectRatio
        ? [1 / imageAspectRatio, canvasAspectRatio / imageAspectRatio]
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

  public draw() {
    const gl: WebGLContext = this._gl;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    const texture: WebGLTexture = this._texture;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    indexBufferObject.bindAndExecute({
      gl,
      callback: (boundBuffer: IndexBufferObject) => {
        boundBuffer.draw({ gl, mode: gl.TRIANGLES });
      },
    });
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
