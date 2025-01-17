import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Matrix44 } from "../../shared/linearAlgebra/matrix44";
import { Vector3 } from "../../shared/linearAlgebra/vector3";
import { Timer } from "../../shared/util/timer";

function getCoordinates(
  scalarLengths: [number, number],
  scalarGridPoints: [number, number],
): Float32Array {
  const coordinates = new Float32Array(
    "xy".length * scalarGridPoints[0] * scalarGridPoints[1],
  );
  const dx = scalarLengths[0] / scalarGridPoints[0];
  const dy = scalarLengths[1] / scalarGridPoints[1];
  for (let j = 0; j < scalarGridPoints[1]; j++) {
    const y = 0.5 * (2 * j + 1) * dy - 0.5 * scalarLengths[1];
    for (let i = 0; i < scalarGridPoints[0]; i++) {
      const x = 0.5 * (2 * i + 1) * dx - 0.5 * scalarLengths[0];
      coordinates["xy".length * (j * scalarGridPoints[0] + i) + 0] = x;
      coordinates["xy".length * (j * scalarGridPoints[0] + i) + 1] = y;
    }
  }
  return coordinates;
}

function setScalarField(
  coordinates: Float32Array,
  scalarHeight: Float32Array,
  scalarNormal: Float32Array,
  counter: number,
) {
  const xFreq = 5;
  const yFreq = 2;
  const xPhase = 0.314;
  const yPhase = 0.141;
  const amp = 0.05;
  const nCoordinates = coordinates.length;
  for (let n = 0; n < nCoordinates / 2; n++) {
    const x = coordinates[2 * n + 0];
    const y = coordinates[2 * n + 1];
    const xOmega = 2 * Math.PI * xFreq;
    const yOmega = 2 * Math.PI * yFreq;
    const xComp = Math.sin(xOmega * x + xPhase * counter);
    const yComp = Math.sin(yOmega * y + yPhase * counter);
    const dxComp = xOmega * Math.cos(xOmega * x + xPhase * counter);
    const dyComp = yOmega * Math.cos(yOmega * y + yPhase * counter);
    scalarHeight[n] = amp * xComp * yComp;
    const nx = amp * dxComp * yComp;
    const ny = amp * xComp * dyComp;
    const nz = 1;
    const norm = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2) + Math.pow(nz, 2));
    scalarNormal[3 * n + 0] = nx / norm;
    scalarNormal[3 * n + 1] = ny / norm;
    scalarNormal[3 * n + 2] = nz / norm;
  }
}

function draw(
  webGLObjects: WebGLObjects,
  coordinates: Float32Array,
  scalarHeight: Float32Array,
  scalarNormal: Float32Array,
  counter: number,
  timer: Timer,
) {
  setScalarField(coordinates, scalarHeight, scalarNormal, counter);
  const xRotationMatrix = new Matrix44({
    type: "rotate",
    angle: 0.35 * Math.PI,
    vector: new Vector3({ x: -1, y: 0, z: 0 }),
  });
  const zRotationMatrix = new Matrix44({
    type: "rotate",
    angle: 0.01 * counter,
    vector: new Vector3({ x: 0, y: 0, z: -1 }),
  });
  const rotationMatrix = xRotationMatrix.matmul(zRotationMatrix);
  webGLObjects.draw(scalarHeight, scalarNormal, rotationMatrix);
  timer.update();
  requestAnimationFrame(() => {
    draw(
      webGLObjects,
      coordinates,
      scalarHeight,
      scalarNormal,
      counter + 1,
      timer,
    );
  });
}

window.addEventListener("load", (): void => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // create two-dimensional scalar fields to be superposed
  // NOTE: aspect ratios should be identical
  const scalarLengths: [number, number] = [1, 1];
  const scalarGridPoints: [number, number] = [128, 128];
  const coordinates: Float32Array = getCoordinates(
    scalarLengths,
    scalarGridPoints,
  );
  const scalarHeight = new Float32Array(
    scalarGridPoints[0] * scalarGridPoints[1],
  );
  const scalarNormal = new Float32Array(
    "xyz".length * scalarGridPoints[0] * scalarGridPoints[1],
  );
  window.addEventListener("resize", () => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent();
  });
  const webGLObjects = new WebGLObjects(canvas, scalarGridPoints, coordinates);
  const timer = new Timer(1000, () => {
    /* nothing to do */
  });
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  timer.start();
  draw(webGLObjects, coordinates, scalarHeight, scalarNormal, 0, timer);
});
