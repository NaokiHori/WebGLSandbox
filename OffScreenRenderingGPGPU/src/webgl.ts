import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { Program } from "../../shared/webgl/program";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { setupTextureCoordinates } from "../../shared/webgl/helperFunctions/setupTexture";
import { setupRectangleDomain } from "../../shared/webgl/helperFunctions/setupRectangleDomain";
import { setupStaticallyDrawnData } from "../../shared/webgl/helperFunctions/setupStaticallyDrawnData";
import { setUniform } from "../../shared/webgl/uniform";
import mainVSSource from "../shader/main.vs.glsl?raw";
import mainFSSource from "../shader/main.fs.glsl?raw";
import visualizeVSSource from "../shader/visualize.vs.glsl?raw";
import visualizeFSSource from "../shader/visualize.fs.glsl?raw";

const NDIMS = 2;

const LX = 2;
const LY = 1;

const DIFFUSIVITY = 1e-4;

const WIDTH = 512;
const HEIGHT = 256;

const FRAMEBUFFER_TARGET: GLenum = WebGL2RenderingContext.FRAMEBUFFER;
const TEXTURE_TARGET: GLenum = WebGL2RenderingContext.TEXTURE_2D;

const TEXTURE_CONFIG = {
  internalFormat: WebGL2RenderingContext.R32F,
  format: WebGL2RenderingContext.RED,
  type: WebGL2RenderingContext.FLOAT,
};

interface FramebufferObject {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
}

function computeTimeStepSize(): number {
  const safetyFactor = 0.5;
  const gridSize = Math.min(LX / WIDTH, LY / HEIGHT);
  return ((safetyFactor * 0.5) / NDIMS / DIFFUSIVITY) * Math.pow(gridSize, 2);
}

function initializeFramebuffer(
  gl: WebGL2RenderingContext,
  program: Program,
): FramebufferObject {
  const resultingObject = program.use({
    gl,
    callback: () => {
      const framebuffer = gl.createFramebuffer();
      const texture: WebGLTexture = gl.createTexture();
      (function () {
        gl.bindTexture(TEXTURE_TARGET, texture);
        gl.texStorage2D(
          TEXTURE_TARGET,
          1,
          TEXTURE_CONFIG.internalFormat,
          WIDTH,
          HEIGHT,
        );
        gl.texParameteri(TEXTURE_TARGET, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(TEXTURE_TARGET, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(TEXTURE_TARGET, null);
      })();
      (function () {
        gl.bindFramebuffer(FRAMEBUFFER_TARGET, framebuffer);
        const attachment: GLenum = gl.COLOR_ATTACHMENT0;
        const level: GLint = 0;
        gl.framebufferTexture2D(
          FRAMEBUFFER_TARGET,
          attachment,
          TEXTURE_TARGET,
          texture,
          level,
        );
        gl.bindFramebuffer(FRAMEBUFFER_TARGET, null);
      })();
      const framebufferStatus: GLenum =
        gl.checkFramebufferStatus(FRAMEBUFFER_TARGET);
      if (gl.FRAMEBUFFER_COMPLETE !== framebufferStatus) {
        throw new Error(
          `Failed to create a framebuffer: ${framebufferStatus.toString()}`,
        );
      }
      return { framebuffer, texture };
    },
  });
  return {
    framebuffer: resultingObject.framebuffer,
    texture: resultingObject.texture,
  };
}

export class WebGLObjects {
  private _gl: WebGL2RenderingContext;
  private _mainProgram: Program;
  private _visualizeProgram: Program;
  private _framebufferObjects: [FramebufferObject, FramebufferObject];
  private _mainVertexBufferObject: VertexBufferObject;
  private _visualizeIndexBufferObject: IndexBufferObject;
  private _flipFramebuffers: boolean;

  public constructor(canvas: HTMLCanvasElement) {
    const gl: WebGL2RenderingContext = getWebGL2RenderingContext({
      canvas,
      contextAttributes: { preserveDrawingBuffer: false },
    });
    if (!gl.getExtension("EXT_color_buffer_float")) {
      console.error("FLOAT color buffer is not supported");
    }
    const mainProgram = new Program({
      gl,
      vertexShaderSource: mainVSSource,
      fragmentShaderSource: mainFSSource,
      transformFeedbackVaryings: [],
    });
    const visualizeProgram = new Program({
      gl,
      vertexShaderSource: visualizeVSSource,
      fragmentShaderSource: visualizeFSSource,
      transformFeedbackVaryings: [],
    });
    const framebufferObjects: [FramebufferObject, FramebufferObject] = [
      initializeFramebuffer(gl, mainProgram),
      initializeFramebuffer(gl, mainProgram),
    ];
    const mainVertexBufferObject: VertexBufferObject =
      mainProgram.use<VertexBufferObject>({
        gl,
        callback: (webGLProgram: WebGLProgram) => {
          setUniform({
            gl,
            program: webGLProgram,
            dataType: "FLOAT32",
            uniformName: "u_diffusivity",
            data: [DIFFUSIVITY],
          });
          setUniform({
            gl,
            program: webGLProgram,
            dataType: "FLOAT32",
            uniformName: "u_time_step_size",
            data: [computeTimeStepSize()],
          });
          setUniform({
            gl,
            program: webGLProgram,
            dataType: "FLOAT32",
            uniformName: "u_resolution",
            data: [WIDTH, HEIGHT],
          });
          setUniform({
            gl,
            program: webGLProgram,
            dataType: "FLOAT32",
            uniformName: "u_grid_size",
            data: [LX / WIDTH, LY / HEIGHT],
          });
          const vertexBufferObject: VertexBufferObject = (function () {
            // should agree with the variable defined in the vertex shader
            const numberOfVertices = 3;
            const numberOfItemsForEachVertex = 2;
            return setupStaticallyDrawnData({
              gl,
              program: webGLProgram,
              attributeName: "a_position",
              numberOfVertices,
              numberOfItemsForEachVertex,
              data: new Float32Array(
                numberOfVertices * numberOfItemsForEachVertex,
              ),
            });
          })();
          return vertexBufferObject;
        },
      });
    (function () {
      const xFreq = 2;
      const yFreq = 2;
      const data = new Float32Array(WIDTH * HEIGHT);
      for (let j = 0; j < HEIGHT; j++) {
        const y = 0.5 * (2 * j + 1) * (LY / HEIGHT);
        const sinY = Math.sin(2 * Math.PI * yFreq * y);
        for (let i = 0; i < WIDTH; i++) {
          const x = 0.5 * (2 * i + 1) * (LX / WIDTH);
          const sinX = Math.sin(2 * Math.PI * xFreq * x);
          data[j * WIDTH + i] = 0.5 + 0.5 * sinX * sinY;
        }
      }
      const framebufferObject: FramebufferObject = framebufferObjects[0];
      const framebuffer: WebGLFramebuffer = framebufferObject.framebuffer;
      const texture: WebGLTexture = framebufferObject.texture;
      gl.bindFramebuffer(FRAMEBUFFER_TARGET, framebuffer);
      gl.bindTexture(TEXTURE_TARGET, texture);
      gl.texSubImage2D(
        TEXTURE_TARGET,
        0,
        0,
        0,
        WIDTH,
        HEIGHT,
        TEXTURE_CONFIG.format,
        TEXTURE_CONFIG.type,
        data,
      );
      gl.bindTexture(TEXTURE_TARGET, null);
      gl.bindFramebuffer(FRAMEBUFFER_TARGET, null);
    })();
    const {
      indexBufferObject: visualizeIndexBufferObject,
    }: { indexBufferObject: IndexBufferObject } = visualizeProgram.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        setupTextureCoordinates({
          gl,
          program: webGLProgram,
          attributeName: "a_texture_coordinates",
        });
        return setupRectangleDomain({
          gl,
          program: webGLProgram,
          attributeName: "a_position",
          aspectRatio: WIDTH / HEIGHT,
        });
      },
    });
    this._gl = gl;
    this._mainProgram = mainProgram;
    this._visualizeProgram = visualizeProgram;
    this._framebufferObjects = framebufferObjects;
    this._mainVertexBufferObject = mainVertexBufferObject;
    this._visualizeIndexBufferObject = visualizeIndexBufferObject;
    this._flipFramebuffers = false;
  }

  public handleResizeEvent(canvas: HTMLCanvasElement) {
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._visualizeProgram;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const scale = (function computeScale() {
      const canvasAspectRatio: number = w / h;
      const scalarAspectRatio: number = WIDTH / HEIGHT;
      return canvasAspectRatio < scalarAspectRatio
        ? [1 / scalarAspectRatio, canvasAspectRatio / scalarAspectRatio]
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

  public update(): number {
    const gl = this._gl;
    const framebufferObjects: [FramebufferObject, FramebufferObject] =
      this._framebufferObjects;
    const flipFramebuffers: boolean = this._flipFramebuffers;
    const inputFramebufferObject: FramebufferObject =
      framebufferObjects[flipFramebuffers ? 1 : 0];
    const outputFramebufferObject: FramebufferObject =
      framebufferObjects[flipFramebuffers ? 0 : 1];
    this._mainProgram.use({
      gl,
      callback: () => {
        gl.bindFramebuffer(
          FRAMEBUFFER_TARGET,
          outputFramebufferObject.framebuffer,
        );
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, WIDTH, HEIGHT);
        gl.clearColor(0, 1, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const vertexBufferObject: VertexBufferObject =
          this._mainVertexBufferObject;
        gl.bindTexture(TEXTURE_TARGET, inputFramebufferObject.texture);
        vertexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: VertexBufferObject) => {
            boundBuffer.draw({ gl, mode: gl.TRIANGLES });
          },
        });
        gl.bindTexture(TEXTURE_TARGET, null);
        gl.enable(gl.BLEND);
        gl.bindFramebuffer(FRAMEBUFFER_TARGET, null);
      },
    });
    this._flipFramebuffers = !flipFramebuffers;
    return computeTimeStepSize();
  }

  public draw(canvas: HTMLCanvasElement) {
    const gl = this._gl;
    const framebufferObjects: [FramebufferObject, FramebufferObject] =
      this._framebufferObjects;
    const flipFramebuffers: boolean = this._flipFramebuffers;
    const framebufferObject: FramebufferObject =
      framebufferObjects[flipFramebuffers ? 0 : 1];
    this._visualizeProgram.use({
      gl,
      callback: () => {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const texture: WebGLTexture = framebufferObject.texture;
        const indexBufferObject: IndexBufferObject =
          this._visualizeIndexBufferObject;
        gl.bindTexture(TEXTURE_TARGET, texture);
        indexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: IndexBufferObject) => {
            boundBuffer.draw({ gl, mode: gl.TRIANGLES });
          },
        });
        gl.bindTexture(TEXTURE_TARGET, null);
      },
    });
  }
}
