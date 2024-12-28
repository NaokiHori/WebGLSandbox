import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { Program } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { setupTextureCoordinates } from "../../shared/webgl/helperFunctions/setupTexture";
import { setupRectangleDomain } from "./rect";
import offScreenVSSource from "../shader/off_screen.vs.glsl?raw";
import offScreenFSSource from "../shader/off_screen.fs.glsl?raw";
import mainVSSource from "../shader/main.vs.glsl?raw";
import mainFSSource from "../shader/main.fs.glsl?raw";

const WIDTH = 128;
const HEIGHT = 128;

interface FramebufferObject {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
}

function initializeFramebuffer(gl: WebGL2RenderingContext): FramebufferObject {
  const framebufferTarget: GLenum = gl.FRAMEBUFFER;
  const textureTarget: GLenum = gl.TEXTURE_2D;
  const texture: WebGLTexture = gl.createTexture();
  (function () {
    gl.activeTexture(gl.TEXTURE0);
    const internalFormat: GLenum = gl.RGBA;
    const format: GLenum = gl.RGBA;
    const type: GLenum = gl.UNSIGNED_BYTE;
    gl.bindTexture(textureTarget, texture);
    gl.texImage2D(
      textureTarget,
      0,
      internalFormat,
      WIDTH,
      HEIGHT,
      0,
      format,
      type,
      null,
    );
    gl.texParameteri(textureTarget, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(textureTarget, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(textureTarget, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(textureTarget, null);
  })();
  const framebuffer = gl.createFramebuffer();
  (function () {
    gl.bindFramebuffer(framebufferTarget, framebuffer);
    const attachment: GLenum = gl.COLOR_ATTACHMENT0;
    const level: GLint = 0;
    gl.framebufferTexture2D(
      framebufferTarget,
      attachment,
      textureTarget,
      texture,
      level,
    );
    gl.bindFramebuffer(framebufferTarget, null);
  })();
  return {
    framebuffer,
    texture,
  };
}

export class WebGLObjects {
  private _gl: WebGL2RenderingContext;
  private _offScreenProgram: Program;
  private _mainProgram: Program;
  private _framebufferObject: FramebufferObject;

  public constructor(canvas: HTMLCanvasElement) {
    const gl: WebGL2RenderingContext = getWebGL2RenderingContext({
      canvas,
      contextAttributes: { preserveDrawingBuffer: false },
    });
    const offScreenProgram = new Program({
      gl,
      vertexShaderSource: offScreenVSSource,
      fragmentShaderSource: offScreenFSSource,
      transformFeedbackVaryings: [],
    });
    const mainProgram = new Program({
      gl,
      vertexShaderSource: mainVSSource,
      fragmentShaderSource: mainFSSource,
      transformFeedbackVaryings: [],
    });
    const framebufferObject: FramebufferObject = initializeFramebuffer(gl);
    this._gl = gl;
    this._offScreenProgram = offScreenProgram;
    this._mainProgram = mainProgram;
    this._framebufferObject = framebufferObject;
  }

  public draw(canvas: HTMLCanvasElement) {
    const gl = this._gl;
    const framebufferObject = this._framebufferObject;
    this._offScreenProgram.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        const { indexBufferObject }: { indexBufferObject: IndexBufferObject } =
          setupRectangleDomain({
            gl,
            program: webGLProgram,
            attributeName: "a_position",
          });
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferObject.framebuffer);
        gl.viewport(0, 0, WIDTH, HEIGHT);
        gl.clearColor(1, 0, 0, 1);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        indexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: IndexBufferObject) => {
            boundBuffer.draw({ gl, mode: gl.TRIANGLES });
          },
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      },
    });
    this._mainProgram.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        setupTextureCoordinates({
          gl,
          program: webGLProgram,
          attributeName: "a_texture_coordinates",
        });
        const { indexBufferObject }: { indexBufferObject: IndexBufferObject } =
          setupRectangleDomain({
            gl,
            program: webGLProgram,
            attributeName: "a_position",
          });
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 1, 1);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindTexture(gl.TEXTURE_2D, framebufferObject.texture);
        indexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: IndexBufferObject) => {
            boundBuffer.draw({ gl, mode: gl.TRIANGLES });
          },
        });
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.flush();
      },
    });
  }
}
