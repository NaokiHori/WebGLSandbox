import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { Program } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { Texture, TextureTarget } from "../../shared/webgl/texture";
import { setupTextureCoordinates } from "../../shared/webgl/helperFunctions/setupTexture";
import { setupRectangleDomain } from "../../shared/webgl/helperFunctions/setupRectangleDomain";
import { setUniform } from "../../shared/webgl/uniform";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import sampleImage from "../sample.jpeg";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _program: Program;
  private _indexBufferObject: IndexBufferObject;
  private _texture: Texture;
  private _imageAspectRatio: number;

  private constructor(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    program: Program,
    texture: Texture,
    imageWidth: number,
    imageHeight: number,
  ) {
    const imageAspectRatio: number = imageWidth / imageHeight;
    const { indexBufferObject }: { indexBufferObject: IndexBufferObject } =
      program.use({
        gl,
        callback: (webGLProgram: WebGLProgram) => {
          return setupRectangleDomain({
            gl,
            program: webGLProgram,
            attributeName: "a_position",
            aspectRatio: imageAspectRatio,
          });
        },
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
      const image = new Image();
      const texture = program.use({
        gl,
        callback: (webGLProgram: WebGLProgram) => {
          return new Texture({
            gl,
            target: gl.TEXTURE_2D,
            program: webGLProgram,
            textureUnit: 0,
          });
        },
      });
      image.src = sampleImage;
      image.addEventListener("load", () => {
        program.use({
          gl,
          callback: (webGLProgram: WebGLProgram) => {
            texture.bindAndExecute({
              gl,
              callback: (boundTexture: Texture) => {
                const textureTarget: TextureTarget = boundTexture.target;
                gl.texImage2D(
                  textureTarget,
                  0,
                  gl.RGBA,
                  gl.RGBA,
                  gl.UNSIGNED_BYTE,
                  image,
                );
                gl.generateMipmap(textureTarget);
              },
            });
            setupTextureCoordinates({
              gl,
              program: webGLProgram,
              attributeName: "a_texture_coordinates",
            });
          },
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
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const imageAspectRatio: number = this._imageAspectRatio;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const canvasAspectRatio: number = w / h;
    const scale = (function computeScale() {
      return canvasAspectRatio < imageAspectRatio
        ? [1 / imageAspectRatio, canvasAspectRatio / imageAspectRatio]
        : [1 / canvasAspectRatio, 1];
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
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    const texture: Texture = this._texture;
    program.use({
      gl,
      callback: () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        texture.bindAndExecute({
          gl,
          callback: () => {
            indexBufferObject.bindAndExecute({
              gl,
              callback: (boundBuffer: IndexBufferObject) => {
                boundBuffer.draw({ gl, mode: gl.TRIANGLES });
              },
            });
          },
        });
      },
    });
  }
}
