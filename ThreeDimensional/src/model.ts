import { Vector3 } from "../../shared/linearAlgebra/vector3";
import { Matrix44 } from "../../shared/linearAlgebra/matrix44";

function computeMetricsOnCircle(
  modelParameter: [number, number],
  nLongitude: number,
  s: number,
): { vertices: Vector3[]; normals: Vector3[] } {
  const vertices = new Array<Vector3>();
  const normals = new Array<Vector3>();
  // radius of circle around the torus knot
  const radius = 0.1;
  // torus knot: s in [0 : 1]
  //   r = 1 + 0.5 * cos(2 * PI * P * s)
  //   t = 2 * PI * Q * s
  //   z = sin(2 * PI * P * s)
  const P = modelParameter[0];
  const Q = modelParameter[1];
  const r = 1 + 0.5 * Math.cos(2 * Math.PI * P * s);
  const t = 2 * Math.PI * Q * s;
  const z = Math.sin(2 * Math.PI * P * s);
  // compute cartesian components
  const cost = Math.cos(t);
  const sint = Math.sin(t);
  const x = r * cost;
  const y = r * sint;
  const center = new Vector3({ x, y, z });
  // compute tangential vector to the parametrized function
  const drds = -Math.PI * P * Math.sin(2 * Math.PI * P * s);
  const dtds = 2 * Math.PI * Q;
  const dzds = 2 * Math.PI * P * Math.cos(2 * Math.PI * P * s);
  const dxds = drds * cost - r * dtds * sint;
  const dyds = drds * sint + r * dtds * cost;
  const tangential = new Vector3({ x: dxds, y: dyds, z: dzds }).normalize();
  // draw circle around torus knot
  // consider a vector V from origin to a point on a two-dimensional circle whose normal is (0, 0, 1)
  // compute quaternion projecting (0, 0, 1) to the computed normal, operating it onto V
  const rotateMatrix = (function () {
    const unitZVector = new Vector3({ x: 0, y: 0, z: 1 });
    const r = 1 + unitZVector.dot(tangential);
    const c = unitZVector.cross(tangential);
    const i = c.x;
    const j = c.y;
    const k = c.z;
    const norm = Math.sqrt(
      Math.pow(r, 2) + Math.pow(i, 2) + Math.pow(j, 2) + Math.pow(k, 2),
    );
    return new Matrix44({
      type: "rotate",
      angle: 2 * Math.acos(r / norm),
      vector: new Vector3({ x: i / norm, y: j / norm, z: k / norm }),
    });
  })();
  for (let nL = 0; nL < nLongitude; nL++) {
    const angle = (2 * Math.PI * nL) / nLongitude;
    const normal = rotateMatrix.dot(
      new Vector3({
        x: Math.cos(angle),
        y: Math.sin(angle),
        z: 0,
      }),
    );
    const vertex = center.add(normal.multiply(radius));
    vertices.push(vertex);
    normals.push(normal);
  }
  return { vertices, normals };
}

export function initModel(modelParameter: [number, number]): {
  vertices: Vector3[];
  normals: Vector3[];
  indices: Int16Array;
} {
  const nMeridian = 256;
  const nLongitude = 32;
  let vertices = new Array<Vector3>();
  let normals = new Array<Vector3>();
  let indices = new Array<number>();
  for (let nM = 0; nM < nMeridian; nM++) {
    const data = computeMetricsOnCircle(
      modelParameter,
      nLongitude,
      nM / nMeridian,
    );
    vertices = vertices.concat(data.vertices);
    normals = normals.concat(data.normals);
  }
  for (let nM = 0; nM < nMeridian; nM++) {
    for (let nL = 0; nL < nLongitude; nL++) {
      const cornerIndices = [
        ((nM + 0) % nMeridian) * nLongitude + ((nL + 0) % nLongitude),
        ((nM + 0) % nMeridian) * nLongitude + ((nL + 1) % nLongitude),
        ((nM + 1) % nMeridian) * nLongitude + ((nL + 0) % nLongitude),
        ((nM + 1) % nMeridian) * nLongitude + ((nL + 1) % nLongitude),
      ];
      indices = indices.concat([
        cornerIndices[0],
        cornerIndices[1],
        cornerIndices[2],
      ]);
      indices = indices.concat([
        cornerIndices[1],
        cornerIndices[3],
        cornerIndices[2],
      ]);
    }
  }
  return { vertices, normals, indices: new Int16Array(indices) };
}
