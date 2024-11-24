import { Vector3, Matrix44 } from "./linearAlgebra";

function computeMetricsOnCircle(
  nLongitude: number,
  s: number,
): { vertices: Vector3[]; normals: Vector3[] } {
  const vertices = new Array<Vector3>();
  const normals = new Array<Vector3>();
  // radius of circle around the torus knot
  const radius = 0.05;
  // torus knot: s in [0 : 1]
  //   r = 1 + 0.5 * cos(2 * PI * P * s)
  //   t = 2 * PI * Q * s
  //   z = sin(2 * PI * P * s)
  const P = 3;
  const Q = 5;
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
  // periodicity
  vertices.push(vertices[0]);
  normals.push(normals[0]);
  return { vertices, normals };
}

export function initModel(): { vertices: Vector3[]; normals: Vector3[] } {
  // NOTE: define normal as "from interior to exterior"
  const nMeridian = 512;
  const nLongitude = 32;
  const vertices = new Array<Vector3>();
  const normals = new Array<Vector3>();
  let vertices0: Vector3[] | null = null;
  let normals0: Vector3[] | null = null;
  let vertices1: Vector3[] | null = null;
  let normals1: Vector3[] | null = null;
  ({ vertices: vertices0, normals: normals0 } = computeMetricsOnCircle(
    nLongitude,
    0,
  ));
  for (let nM = 0; nM < nMeridian; nM++) {
    ({ vertices: vertices1, normals: normals1 } = computeMetricsOnCircle(
      nLongitude,
      (nM + 1) / nMeridian,
    ));
    for (let nL = 0; nL < nLongitude; nL++) {
      vertices.push(vertices0[nL + 0]);
      vertices.push(vertices0[nL + 1]);
      vertices.push(vertices1[nL + 0]);
      vertices.push(vertices0[nL + 1]);
      vertices.push(vertices1[nL + 1]);
      vertices.push(vertices1[nL + 0]);
      normals.push(normals0[nL + 0]);
      normals.push(normals0[nL + 1]);
      normals.push(normals1[nL + 0]);
      normals.push(normals0[nL + 1]);
      normals.push(normals1[nL + 1]);
      normals.push(normals1[nL + 0]);
    }
    vertices0 = vertices1;
    normals0 = normals1;
  }
  return { vertices, normals };
}
