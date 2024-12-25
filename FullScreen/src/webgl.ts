import { getContext, WebGLContext } from "../../shared/webgl/context";
import { initProgram } from "../../shared/webgl/program";
import { VertexBufferObject } from "../../shared/webgl/vertexBufferObject";
import { VertexAttribute } from "../../shared/webgl/vertexAttribute";
import vertexShaderSource from "../shader/vertexShader.glsl?raw";
import fragmentShaderSource from "../shader/fragmentShader.glsl?raw";
import vertexShaderSource2 from "../shader/vertexShader.es3.glsl?raw";
import fragmentShaderSource2 from "../shader/fragmentShader.es3.glsl?raw";

// prepare two triangles filling the entire screen,
//   on which a circle is drawn
function initPositions(): number[][] {
  const positions = new Array<number[]>();
  positions.push([-1, -1]);
  positions.push([+1, -1]);
  positions.push([-1, +1]);
  positions.push([+1, +1]);
  return positions;
}

export class WebGLObjects {
  private _canvas: HTMLCanvasElement;
  private _gl: WebGLContext;
  private _program: WebGLProgram;
  private _positionsVertexBufferObject: VertexBufferObject;

  public constructor(canvas: HTMLCanvasElement) {
    // prepare a context
    const gl: WebGLContext = getContext(
      canvas,
      { preserveDrawingBuffer: false },
      true,
    );
    // both WebGL1 and 2 are handled for this page
    // compiler a shader program using the shader sources
    //   which are loaded from the corresponding files
    const isGL2: boolean = gl instanceof WebGL2RenderingContext;
    const program: WebGLProgram = initProgram({
      gl,
      vertexShaderSource: isGL2 ? vertexShaderSource2 : vertexShaderSource,
      fragmentShaderSource: isGL2
        ? fragmentShaderSource2
        : fragmentShaderSource,
      transformFeedbackVaryings: [],
    });
    const positionsVertexBufferObject: VertexBufferObject =
      (function initializePositionsVertexBufferObject() {
        // prepare two triangle elements filling the whole canvas element
        const positions: number[][] = initPositions();
        const numberOfVertices = positions.length;
        const numberOfItemsForEachVertex = "xy".length;
        // create a vertex buffer object: allocating buffer on GPU side
        const vbo = new VertexBufferObject({
          gl,
          numberOfVertices,
          numberOfItemsForEachVertex,
          usage: gl.DYNAMIC_DRAW,
        });
        // active a vertex attribute
        const attribute = new VertexAttribute({
          gl,
          program,
          attributeName: "a_position",
        });
        // bind the buffer and attribute
        vbo.bind(gl);
        attribute.bindWithArrayBuffer(
          gl,
          program,
          numberOfItemsForEachVertex,
          vbo,
        );
        vbo.unbind(gl);
        // push the vertex positions to GPU
        vbo.bind(gl);
        vbo.updateData(gl, new Float32Array(positions.flat()));
        vbo.unbind(gl);
        return vbo;
      })();
    this._canvas = canvas;
    this._gl = gl;
    this._program = program;
    this._positionsVertexBufferObject = positionsVertexBufferObject;
  }

  public handleResizeEvent() {
    const canvas: HTMLCanvasElement = this._canvas;
    const gl: WebGLContext = this._gl;
    const program: WebGLProgram = this._program;
    const w: number = canvas.width;
    const h: number = canvas.height;
    const asp: number = w / h;
    const scale = (function computeScale() {
      return asp < 1 ? [1, 1 * asp] : [1 / asp, 1];
    })();
    gl.viewport(0, 0, w, h);
    gl.uniform2f(gl.getUniformLocation(program, "u_scale"), scale[0], scale[1]);
  }

  public draw() {
    const gl: WebGLContext = this._gl;
    const vbo: VertexBufferObject = this._positionsVertexBufferObject;
    // the vertex data is unchanged, and just a draw call is invoked
    vbo.draw(gl, gl.TRIANGLE_STRIP);
  }
}
