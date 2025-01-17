import { getWebGL2RenderingContext } from "../../shared/webgl/context";
import { Program } from "../../shared/webgl/program";
import { Texture } from "../../shared/webgl/texture";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { setupStaticallyDrawnData } from "../../shared/webgl/helperFunctions/setupStaticallyDrawnData";
import { setUniform, setUniformMatrix } from "../../shared/webgl/uniform";
import { Matrix44 } from "../../shared/linearAlgebra/matrix44";
import { Vector3 } from "../../shared/linearAlgebra/vector3";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGL2RenderingContext;
  private _program: Program;
  // xy positions
  private _indexBufferObject: IndexBufferObject;
  private _scalarHeightTexture: Texture;
  private _scalarNormalTexture: Texture;
  private _scalarGridPoints: [number, number];
  private _aspectRatio: number;

  public constructor(
    canvas: HTMLCanvasElement,
    scalarGridPoints: [number, number],
    coordinates: Float32Array,
  ) {
    const gl: WebGL2RenderingContext = getWebGL2RenderingContext({
      canvas,
      contextAttributes: {
        preserveDrawingBuffer: false,
      },
    });
    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error("FLOAT color buffer is not supported");
    }
    const program = new Program({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "INT32",
          uniformName: "u_scalar_grid",
          data: [scalarGridPoints[0], scalarGridPoints[1]],
        });
      },
    });
    const scalarHeightTexture: Texture = program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        const scalarHeightTexture = new Texture({
          gl,
          program: webGLProgram,
          textureTarget: gl.TEXTURE_2D,
          textureUnit: 0,
          textureName: "u_scalar_height",
        });
        scalarHeightTexture.bindAndExecute({
          gl,
          callback: (boundTexture: Texture) => {
            gl.texStorage2D(
              boundTexture.textureTarget,
              1,
              gl.R32F,
              scalarGridPoints[0],
              scalarGridPoints[1],
            );
            gl.texParameteri(
              boundTexture.textureTarget,
              gl.TEXTURE_MIN_FILTER,
              gl.NEAREST,
            );
            gl.texParameteri(
              boundTexture.textureTarget,
              gl.TEXTURE_MAG_FILTER,
              gl.NEAREST,
            );
          },
        });
        return scalarHeightTexture;
      },
    });
    const scalarNormalTexture: Texture = program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        const scalarNormalTexture = new Texture({
          gl,
          program: webGLProgram,
          textureTarget: gl.TEXTURE_2D,
          textureUnit: 1,
          textureName: "u_scalar_normal",
        });
        scalarNormalTexture.bindAndExecute({
          gl,
          callback: (boundTexture: Texture) => {
            gl.texStorage2D(
              boundTexture.textureTarget,
              1,
              gl.RGB32F,
              scalarGridPoints[0],
              scalarGridPoints[1],
            );
            gl.texParameteri(
              boundTexture.textureTarget,
              gl.TEXTURE_MIN_FILTER,
              gl.NEAREST,
            );
            gl.texParameteri(
              boundTexture.textureTarget,
              gl.TEXTURE_MAG_FILTER,
              gl.NEAREST,
            );
          },
        });
        return scalarNormalTexture;
      },
    });
    program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        setupStaticallyDrawnData({
          gl,
          program: webGLProgram,
          attributeName: "a_position",
          numberOfVertices: scalarGridPoints[0] * scalarGridPoints[1],
          numberOfItemsForEachVertex: "xy".length,
          data: coordinates,
        });
        setupStaticallyDrawnData({
          gl,
          program: webGLProgram,
          attributeName: "a_normal",
          numberOfVertices: scalarGridPoints[0] * scalarGridPoints[1],
          numberOfItemsForEachVertex: "xy".length,
          data: new Float32Array(
            "xy".length * scalarGridPoints[0] * scalarGridPoints[1],
          ),
        });
      },
    });
    const indexBufferObject: IndexBufferObject = program.use({
      gl,
      callback: () => {
        const indices = new Int16Array(
          (scalarGridPoints[0] - 1) * (scalarGridPoints[1] - 1) * 6,
        );
        for (let j = 0; j < scalarGridPoints[1] - 1; j++) {
          for (let i = 0; i < scalarGridPoints[0] - 1; i++) {
            indices[6 * (j * (scalarGridPoints[0] - 1) + i) + 0] =
              (j + 0) * scalarGridPoints[0] + (i + 0);
            indices[6 * (j * (scalarGridPoints[0] - 1) + i) + 1] =
              (j + 0) * scalarGridPoints[0] + (i + 1);
            indices[6 * (j * (scalarGridPoints[0] - 1) + i) + 2] =
              (j + 1) * scalarGridPoints[0] + (i + 0);
            indices[6 * (j * (scalarGridPoints[0] - 1) + i) + 3] =
              (j + 0) * scalarGridPoints[0] + (i + 1);
            indices[6 * (j * (scalarGridPoints[0] - 1) + i) + 4] =
              (j + 1) * scalarGridPoints[0] + (i + 1);
            indices[6 * (j * (scalarGridPoints[0] - 1) + i) + 5] =
              (j + 1) * scalarGridPoints[0] + (i + 0);
          }
        }
        const indexBufferObject = new IndexBufferObject({
          gl,
          size: (scalarGridPoints[0] - 1) * (scalarGridPoints[1] - 1) * 6,
          usage: gl.STATIC_DRAW,
        });
        indexBufferObject.bindAndExecute({
          gl,
          callback: (boundBuffer: IndexBufferObject) => {
            boundBuffer.updateData({ gl, data: indices });
          },
        });
        return indexBufferObject;
      },
    });
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._scalarHeightTexture = scalarHeightTexture;
    this._scalarNormalTexture = scalarNormalTexture;
    this._scalarGridPoints = scalarGridPoints;
    this._indexBufferObject = indexBufferObject;
    this._aspectRatio = canvas.width / canvas.height;
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const canvasWidth: number = canvas.width;
    const canvasHeight: number = canvas.height;
    program.use({
      gl,
      callback: () => {
        gl.viewport(0, 0, canvasWidth, canvasHeight);
      },
    });
    this._aspectRatio = canvasWidth / canvasHeight;
  }

  public draw(
    scalarHeight: Float32Array,
    scalarNormal: Float32Array,
    rotationMatrix: Matrix44,
  ) {
    // TODO: to suppress unused variable warning
    const gl: WebGL2RenderingContext = this._gl;
    const program: Program = this._program;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    const scalarHeightTexture: Texture = this._scalarHeightTexture;
    const scalarNormalTexture: Texture = this._scalarNormalTexture;
    const scalarGridPoints: [number, number] = this._scalarGridPoints;
    const modelMatrix: Matrix44 = rotationMatrix;
    const cameraPosition = new Vector3({
      x: 0,
      y: 0,
      z: 4,
    });
    const viewMatrix: Matrix44 = new Matrix44({
      type: "translate",
      offset: cameraPosition.multiply(-1),
    });
    const perspectiveMatrix = new Matrix44({
      type: "perspective",
      fieldOfView: (1 / 256) * Math.PI,
      aspectRatio: this._aspectRatio,
      near: cameraPosition.norm(),
      far: cameraPosition.norm() * 2,
    });
    program.use({
      gl,
      callback: (webGLProgram: WebGLProgram) => {
        setUniform({
          gl,
          program: webGLProgram,
          dataType: "FLOAT32",
          uniformName: "u_light",
          data: new Vector3({
            x: 2,
            y: 2,
            z: -1,
          })
            .normalize()
            .flat(),
        });
        setUniformMatrix({
          gl,
          program: webGLProgram,
          uniformName: "u_mvp_matrix",
          data: perspectiveMatrix
            .matmul(viewMatrix)
            .matmul(modelMatrix)
            .transpose()
            .flat(),
        });
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        scalarHeightTexture.bindAndExecute({
          gl,
          callback: (boundScalarHeightTexture: Texture) => {
            gl.texSubImage2D(
              boundScalarHeightTexture.textureTarget,
              0,
              0,
              0,
              scalarGridPoints[0],
              scalarGridPoints[1],
              gl.RED,
              gl.FLOAT,
              scalarHeight,
            );
            scalarNormalTexture.bindAndExecute({
              gl,
              callback: (boundScalarNormalTexture: Texture) => {
                gl.texSubImage2D(
                  boundScalarNormalTexture.textureTarget,
                  0,
                  0,
                  0,
                  scalarGridPoints[0],
                  scalarGridPoints[1],
                  gl.RGB,
                  gl.FLOAT,
                  scalarNormal,
                );
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
      },
    });
  }
}
