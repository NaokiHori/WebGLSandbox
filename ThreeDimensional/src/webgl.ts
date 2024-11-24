import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { initVBO, VBOConfig } from "../../shared/webgl/vbo";
import { Matrix44, Vector3 } from "./linearAlgebra";
import { initModel } from "./model";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import vertexShaderSource2 from "../shader/vertexShader.es3.glsl?raw";
import fragmentShaderSource2 from "../shader/fragmentShader.es3.glsl?raw";

function initColors(vertices: Vector3[]): number[][] {
  const colors = vertices.map(() => {
    return [0.6627450980392157, 0.807843137254902, 0.9254901960784314, 1];
  });
  return colors;
}

function getModelMatrix(
  rotateMatrix: Matrix44,
  scaleFactor: number,
  offset: Vector3,
): Matrix44 {
  const scaleMatrix = new Matrix44({
    type: "scale",
    factor: new Vector3({
      x: scaleFactor,
      y: scaleFactor,
      z: scaleFactor,
    }),
  });
  const translateMatrix = new Matrix44({
    type: "translate",
    offset,
  });
  return translateMatrix.matmul(rotateMatrix.matmul(scaleMatrix));
}

export class WebGLObjects {
  gl: WebGLContext;
  program: WebGLProgram;
  handleResizeEvent: (canvas: HTMLCanvasElement) => void;
  private _nVertices: number;
  private _useDiffuseLight: boolean;
  private _useAmbientLight: boolean;
  private _scale: number;

  constructor(canvas: HTMLCanvasElement) {
    const gl: WebGLContext = getContext(canvas);
    const isGL2: boolean = gl instanceof WebGL2RenderingContext;
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1);
    const program = initProgram(
      gl,
      isGL2 ? vertexShaderSource2 : vertexShaderSource,
      isGL2 ? fragmentShaderSource2 : fragmentShaderSource,
    );
    const handleResizeEvent = (c: HTMLCanvasElement): void => {
      const w: number = c.width;
      const h: number = c.height;
      gl.viewport(0, 0, w, h);
    };
    const { vertices, normals }: { vertices: Vector3[]; normals: Vector3[] } =
      initModel();
    const colors = initColors(vertices);
    initVBO(
      gl,
      program,
      {
        attributeName: "a_position",
        stride: "xyz".length,
        usage: gl.STATIC_DRAW,
      } satisfies VBOConfig,
      new Float32Array(
        vertices.flatMap((vertex: Vector3) => [vertex.x, vertex.y, vertex.z]),
      ),
    );
    initVBO(
      gl,
      program,
      {
        attributeName: "a_normal",
        stride: "xyz".length,
        usage: gl.STATIC_DRAW,
      } satisfies VBOConfig,
      new Float32Array(
        normals.flatMap((normal: Vector3) => [normal.x, normal.y, normal.z]),
      ),
    );
    initVBO(
      gl,
      program,
      {
        attributeName: "a_color",
        stride: "rgba".length,
        usage: gl.STATIC_DRAW,
      } satisfies VBOConfig,
      new Float32Array(colors.flat()),
    );
    this.gl = gl;
    this.program = program;
    this.handleResizeEvent = handleResizeEvent;
    this._nVertices = vertices.length;
    this._scale = 1;
    this._useDiffuseLight = true;
    this._useAmbientLight = true;
  }

  public draw(rotationMatrix: Matrix44, aspectRatio: number) {
    const gl: WebGLContext = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const viewMatrix: Matrix44 = (function () {
      return new Matrix44({
        type: "translate",
        offset: new Vector3({
          x: 0.0,
          y: 0.0,
          z: -8.0,
        }),
      });
    })();
    const perspectiveMatrix = new Matrix44({
      type: "perspective",
      fieldOfView: (1 / 256) * Math.PI,
      aspectRatio,
      near: 8,
      far: 16,
    });
    const vpMatrix: Matrix44 = perspectiveMatrix.matmul(viewMatrix);
    const offsets = [new Vector3({ x: +0.0, y: +0.0, z: +0.0 })];
    for (const offset of offsets) {
      const modelMatrix: Matrix44 = getModelMatrix(
        rotationMatrix,
        this._scale,
        offset,
      );
      gl.uniformMatrix4fv(
        gl.getUniformLocation(this.program, "u_mvp_matrix"),
        false,
        new Float32Array(vpMatrix.matmul(modelMatrix).transpose().flat()),
      );
      gl.uniform1f(
        gl.getUniformLocation(this.program, "u_use_diffuse_light"),
        this._useDiffuseLight ? 1 : 0,
      );
      if (this._useDiffuseLight) {
        const light = new Vector3({
          x: 2,
          y: 2,
          z: -1,
        }).normalize();
        const inverseModelMatrix: Matrix44 = modelMatrix.inv();
        const projectedLight: Vector3 = inverseModelMatrix.dot(light);
        gl.uniform3fv(
          gl.getUniformLocation(this.program, "u_diffuse_light"),
          new Float32Array(projectedLight.flat()),
        );
      }
      if (this._useAmbientLight) {
        gl.uniform4fv(
          gl.getUniformLocation(this.program, "u_ambient_light_color"),
          new Float32Array([0.05, 0.05, 0.05, 0]),
        );
      } else {
        gl.uniform4fv(
          gl.getUniformLocation(this.program, "u_ambient_light_color"),
          new Float32Array([0, 0, 0, 0]),
        );
      }
      gl.drawArrays(gl.TRIANGLES, 0, this._nVertices);
    }
  }

  public updateScale(scale: number) {
    this._scale = scale;
  }

  public toggleDiffuseLight() {
    this._useDiffuseLight = !this._useDiffuseLight;
  }

  public toggleAmbientLight() {
    this._useAmbientLight = !this._useAmbientLight;
  }
}
