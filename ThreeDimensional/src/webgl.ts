import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { VertexAttribute } from "../../shared/webgl/vertexAttribute";
import { IndexBufferObject } from "../../shared/webgl/indexBufferObject";
import { Vector3 } from "../../shared/linearAlgebra/vector3";
import { Matrix44 } from "../../shared/linearAlgebra/matrix44";
import { initModel } from "./model";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";

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

// do the following in one-piece
// - create and allocate vbo
// - create attribute
// - bind them
// - push data (because the vertex information will not be altered)
function setupVertexBufferObjectAndAttribute({
  gl,
  program,
  attributeName,
  numberOfVertices,
  numberOfItemsForEachVertex,
  data,
}: {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  attributeName: string;
  numberOfVertices: number;
  numberOfItemsForEachVertex: number;
  data: Float32Array;
}) {
  const vbo = new VertexBufferObject({
    gl,
    numberOfVertices,
    numberOfItemsForEachVertex,
    usage: gl.STATIC_DRAW,
  });
  const attribute = new VertexAttribute({
    gl,
    program,
    attributeName,
  });
  vbo.bind(gl);
  attribute.bindWithArrayBuffer(gl, program, numberOfItemsForEachVertex, vbo);
  vbo.updateData(gl, data);
  vbo.unbind(gl);
}

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _useDiffuseLight: boolean;
  private _useAmbientLight: boolean;
  private _useSpecularLight: boolean;
  private _scale: number;
  private _indexBufferObject: IndexBufferObject;

  constructor(canvas: HTMLCanvasElement, modelParameter: [number, number]) {
    const gl: WebGLContext = getContext(
      canvas,
      { preserveDrawingBuffer: false },
      false,
    );
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1);
    const program = initProgram({
      gl,
      vertexShaderSource,
      fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    const modelData = initModel(modelParameter);
    const numberOfVertices = modelData.numberOfVertices;
    setupVertexBufferObjectAndAttribute({
      gl,
      program,
      attributeName: "a_position",
      numberOfVertices,
      numberOfItemsForEachVertex: "xyz".length,
      data: modelData.vertices,
    });
    setupVertexBufferObjectAndAttribute({
      gl,
      program,
      attributeName: "a_normal",
      numberOfVertices,
      numberOfItemsForEachVertex: "xyz".length,
      data: modelData.normals,
    });
    setupVertexBufferObjectAndAttribute({
      gl,
      program,
      attributeName: "a_color",
      numberOfVertices,
      numberOfItemsForEachVertex: "rgba".length,
      data: modelData.colors,
    });
    const indexBufferObject = new IndexBufferObject({
      gl,
      size: modelData.indices.length,
      usage: gl.STATIC_DRAW,
    });
    indexBufferObject.bind({ gl });
    indexBufferObject.updateData({ gl, data: modelData.indices });
    indexBufferObject.unbind({ gl });
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._scale = 1;
    this._useDiffuseLight = true;
    this._useAmbientLight = true;
    this._useSpecularLight = true;
    this._indexBufferObject = indexBufferObject;
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const w: number = canvas.width;
    const h: number = canvas.height;
    gl.viewport(0, 0, w, h);
  }

  public draw(rotationMatrix: Matrix44, aspectRatio: number) {
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const indexBufferObject: IndexBufferObject = this._indexBufferObject;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // object
    const modelMatrix: Matrix44 = getModelMatrix(
      rotationMatrix,
      this._scale,
      new Vector3({ x: 0.0, y: 0.0, z: 0.0 }),
    );
    const inverseModelMatrix: Matrix44 = modelMatrix.inv();
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "u_inverse_model_matrix"),
      false,
      new Float32Array(inverseModelMatrix.transpose().flat()),
    );
    // camera
    const cameraPosition = new Vector3({
      x: 0,
      y: 0,
      z: 8,
    });
    const viewMatrix: Matrix44 = new Matrix44({
      type: "translate",
      offset: cameraPosition.multiply(-1),
    });
    const perspectiveMatrix = new Matrix44({
      type: "perspective",
      fieldOfView: (1 / 256) * Math.PI,
      aspectRatio,
      near: cameraPosition.norm(),
      far: cameraPosition.norm() * 2,
    });
    (function initializeCamera(program: WebGLProgram) {
      const lineOfSight = cameraPosition.normalize().multiply(-1);
      gl.uniform3fv(
        gl.getUniformLocation(program, "u_line_of_sight"),
        new Float32Array(lineOfSight.flat()),
      );
    })(program);
    // light configurations
    (function initializeLight(program: WebGLProgram) {
      const light = new Vector3({
        x: 2,
        y: 2,
        z: -1,
      }).normalize();
      gl.uniform3fv(
        gl.getUniformLocation(program, "u_diffuse_light"),
        new Float32Array(light.flat()),
      );
    })(program);
    gl.uniform1f(
      gl.getUniformLocation(program, "u_use_diffuse_light"),
      this._useDiffuseLight ? 1 : 0,
    );
    gl.uniform1f(
      gl.getUniformLocation(program, "u_use_ambient_light"),
      this._useAmbientLight ? 1 : 0,
    );
    gl.uniform1f(
      gl.getUniformLocation(program, "u_use_specular_light"),
      this._useSpecularLight ? 1 : 0,
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "u_ambient_light_color"),
      new Float32Array([0.05, 0.05, 0.05, 0]),
    );
    // find mvp matrix
    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "u_mvp_matrix"),
      false,
      new Float32Array(
        perspectiveMatrix
          .matmul(viewMatrix)
          .matmul(modelMatrix)
          .transpose()
          .flat(),
      ),
    );
    // draw using index buffer object
    indexBufferObject.bind({ gl });
    indexBufferObject.draw({ gl, mode: gl.TRIANGLES });
    indexBufferObject.unbind({ gl });
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

  public toggleSpecularLight() {
    this._useSpecularLight = !this._useSpecularLight;
  }
}
