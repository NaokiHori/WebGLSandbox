import { Vector3 } from "./vector3";
import { Quaternion } from "./quaternion";

export class Matrix44 {
  private _data: number[];

  public constructor(
    arg:
      | { type: "zero" }
      | { type: "scale"; factor: Vector3 }
      | { type: "translate"; offset: Vector3 }
      | { type: "rotate"; angle: number; vector: Vector3 }
      | {
          type: "perspective";
          fieldOfView: number;
          aspectRatio: number;
          near: number;
          far: number;
        },
  ) {
    const m = (function () {
      if ("zero" === arg.type) {
        return [
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ];
      } else if ("scale" === arg.type) {
        const x: number = arg.factor.x;
        const y: number = arg.factor.y;
        const z: number = arg.factor.z;
        return [
          [x, 0, 0, 0],
          [0, y, 0, 0],
          [0, 0, z, 0],
          [0, 0, 0, 1],
        ];
      } else if ("translate" === arg.type) {
        const x: number = arg.offset.x;
        const y: number = arg.offset.y;
        const z: number = arg.offset.z;
        return [
          [1, 0, 0, x],
          [0, 1, 0, y],
          [0, 0, 1, z],
          [0, 0, 0, 1],
        ];
      } else if ("rotate" === arg.type) {
        // ref: https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Quaternion-derived_rotation_matrix
        const angle: number = arg.angle;
        const vector = (function normalizeVector() {
          const v: Vector3 = arg.vector;
          const norm: number = v.norm();
          return new Vector3({
            x: v.x / norm,
            y: v.y / norm,
            z: v.z / norm,
          });
        })();
        const q = (function initQuaternion() {
          const c = Math.cos(0.5 * angle);
          const s = Math.sin(0.5 * angle);
          return new Quaternion({
            r: c,
            i: s * vector.x,
            j: s * vector.y,
            k: s * vector.z,
          });
        })();
        const s = 1 / Math.pow(q.norm(), 2);
        const ii = q.i * q.i;
        const jj = q.j * q.j;
        const kk = q.k * q.k;
        const ij = q.i * q.j;
        const jk = q.j * q.k;
        const kr = q.k * q.r;
        const ri = q.r * q.i;
        const ki = q.k * q.i;
        const rj = q.r * q.j;
        const m00 = 1 - 2 * s * (jj + kk);
        const m01 = 0 + 2 * s * (ij - kr);
        const m02 = 0 + 2 * s * (ki + rj);
        const m03 = 0;
        const m10 = 0 + 2 * s * (ij + kr);
        const m11 = 1 - 2 * s * (kk + ii);
        const m12 = 0 + 2 * s * (jk - ri);
        const m13 = 0;
        const m20 = 0 + 2 * s * (ki - rj);
        const m21 = 0 + 2 * s * (jk + ri);
        const m22 = 1 - 2 * s * (ii + jj);
        const m23 = 0;
        const m30 = 0;
        const m31 = 0;
        const m32 = 0;
        const m33 = 1;
        return [
          [m00, m01, m02, m03],
          [m10, m11, m12, m13],
          [m20, m21, m22, m23],
          [m30, m31, m32, m33],
        ];
      } else {
        // "perspective" === arg.type
        // reference:
        //   https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection#perspective_projection_matrix
        //   https://www.scratchapixel.com/lessons/3d-basic-rendering/perspective-and-orthographic-projection-matrix/opengl-perspective-projection-matrix.html
        const fieldOfView: number = arg.fieldOfView;
        const aspectRatio: number = arg.aspectRatio;
        const near: number = arg.near;
        const far: number = arg.far;
        const f: number = 1 / Math.tan(0.5 * fieldOfView);
        return [
          [f / aspectRatio, 0, 0, 0],
          [0, f, 0, 0],
          [0, 0, 0 - (far + near) / (far - near), -1],
          [0, 0, 0 - (2 * far * near) / (far - near), 0],
        ];
      }
    })();
    this._data = m.flat();
  }

  public transpose(): Matrix44 {
    const data: number[] = this._data;
    const newMatrix = new Matrix44({ type: "zero" });
    const newData: number[] = newMatrix._data;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newData[j * 4 + i] = data[i * 4 + j];
      }
    }
    return newMatrix;
  }

  public matmul(matrix: Matrix44): Matrix44 {
    const l: number[] = this._data;
    const r: number[] = matrix._data;
    const newMatrix = new Matrix44({ type: "zero" });
    const m: number[] = newMatrix._data;
    for (let i = 0; i < 4; i++) {
      for (let k = 0; k < 4; k++) {
        for (let j = 0; j < 4; j++) {
          m[i * 4 + j] += l[i * 4 + k] * r[k * 4 + j];
        }
      }
    }
    return newMatrix;
  }

  public inv(): Matrix44 {
    const inv = new Array<number>(16).fill(0);
    const arr = new Array<number>(16).fill(0);
    for (let n = 0; n < 16; n++) {
      arr[n] = this._data[n];
    }
    // initialize inverse matrix as an identity matrix
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        inv[i * 4 + j] = i == j ? 1 : 0;
      }
    }
    // forward sweep
    for (let i = 0; i < 4; i++) {
      // normalize i-th row
      {
        const f = 1 / arr[i * 4 + i];
        arr[i * 4 + i] = 1;
        for (let j = i + 1; j < 4; j++) {
          arr[i * 4 + j] *= f;
        }
        for (let j = 0; j < i + 1; j++) {
          inv[i * 4 + j] *= f;
        }
      }
      // eliminate lower-triangular part
      for (let ii = i + 1; ii < 4; ii++) {
        const f = arr[ii * 4 + i];
        for (let j = i; j < 4; j++) {
          arr[ii * 4 + j] -= f * arr[i * 4 + j];
        }
        for (let j = 0; j < i + 1; j++) {
          inv[ii * 4 + j] -= f * inv[i * 4 + j];
        }
      }
    }
    // backward substitution
    for (let i = 3; ; i--) {
      // eliminate upper-triangular part
      for (let ii = 0; ii < i; ii++) {
        const f = arr[ii * 4 + i];
        arr[ii * 4 + i] = 0;
        for (let j = 0; j < 4; j++) {
          inv[ii * 4 + j] -= f * inv[i * 4 + j];
        }
      }
      if (0 == i) {
        break;
      }
    }
    const m = new Matrix44({ type: "zero" });
    for (let n = 0; n < 16; n++) {
      m._data[n] = inv[n];
    }
    return m;
  }

  public dot(v: Vector3): Vector3 {
    const input: number[] = [v.flat(), 1].flat();
    const vector = new Array<number>(4).fill(0);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        vector[i] += this._data[i * 4 + j] * input[j];
      }
    }
    return new Vector3({
      x: vector[0],
      y: vector[1],
      z: vector[2],
    });
  }

  public flat(): number[] {
    return this._data;
  }
}
