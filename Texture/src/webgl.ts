import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO, IndexBufferObject } from "../../shared/webgl/buffer";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import sampleImage from "../sample.jpeg";

function initVertices(aspectRatio: number): {
  positions: Float32Array;
  indices: Int16Array;
} {
  const positions = new Array<number[]>();
  positions.push([-aspectRatio, -1]);
  positions.push([+aspectRatio, -1]);
  positions.push([-aspectRatio, +1]);
  positions.push([+aspectRatio, +1]);
  const indices = [0, 1, 2, 1, 3, 2];
  return {
    positions: new Float32Array(positions.flat()),
    indices: new Int16Array(indices),
  };
}

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
    const { positions, indices } = initVertices(imageAspectRatio);
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
      gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);
      const image = new Image();
      const texture: WebGLTexture = gl.createTexture();
      image.src = sampleImage;
      image.onload = () => {
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
      };
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
    gl.uniform2f(gl.getUniformLocation(program, "u_scale"), scale[0], scale[1]);
  }

  public draw() {
    const gl: WebGLContext = this._gl;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    const texture: WebGLTexture = this._texture;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    indexBufferObject.draw({
      otherTasks: () => {
        /* nothing else to do for this ibo */
      },
    });
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}
