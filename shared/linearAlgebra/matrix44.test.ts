import { expect, test } from "vitest";
import { Vector3 } from "./vector3";
import { Matrix44 } from "./matrix44";

const RESIDUAL = 8;

test("Scale matrix", () => {
  const inputVector = new Vector3({ x: 2, y: 3, z: 5 });
  const factor = 2;
  const outputVector = inputVector.multiply(factor);
  const m = new Matrix44({ type: "scale", factor: inputVector });
  const originalVector = new Vector3({ x: factor, y: factor, z: factor });
  const scaledVector: Vector3 = m.dot(originalVector);
  expect(scaledVector.x).toBeCloseTo(outputVector.x, RESIDUAL);
  expect(scaledVector.y).toBeCloseTo(outputVector.y, RESIDUAL);
  expect(scaledVector.z).toBeCloseTo(outputVector.z, RESIDUAL);
});

test("Translation matrix", () => {
  const inputVector = new Vector3({ x: 2, y: 3, z: 5 });
  const offsetVector = new Vector3({ x: 1, y: 2, z: 3 });
  const outputVector = inputVector.add(offsetVector);
  const m = new Matrix44({ type: "translate", offset: offsetVector });
  const translatedVector: Vector3 = m.dot(inputVector);
  expect(translatedVector.x).toBeCloseTo(outputVector.x, RESIDUAL);
  expect(translatedVector.y).toBeCloseTo(outputVector.y, RESIDUAL);
  expect(translatedVector.z).toBeCloseTo(outputVector.z, RESIDUAL);
});

test("Rotation matrix, around x", () => {
  const inputVector = new Vector3({ x: 2, y: 3, z: 5 });
  const m = new Matrix44({
    type: "rotate",
    angle: 0.5 * Math.PI,
    vector: new Vector3({ x: 1, y: 0, z: 0 }),
  });
  const rotatedVector: Vector3 = m.dot(inputVector);
  expect(rotatedVector.x).toBeCloseTo(2, RESIDUAL);
  expect(rotatedVector.y).toBeCloseTo(-5, RESIDUAL);
  expect(rotatedVector.z).toBeCloseTo(3, RESIDUAL);
});

test("Rotation matrix, around y", () => {
  const inputVector = new Vector3({ x: 2, y: 3, z: 5 });
  const m = new Matrix44({
    type: "rotate",
    angle: 0.5 * Math.PI,
    vector: new Vector3({ x: 0, y: 1, z: 0 }),
  });
  const rotatedVector: Vector3 = m.dot(inputVector);
  expect(rotatedVector.x).toBeCloseTo(5, RESIDUAL);
  expect(rotatedVector.y).toBeCloseTo(3, RESIDUAL);
  expect(rotatedVector.z).toBeCloseTo(-2, RESIDUAL);
});

test("Rotation matrix, around z", () => {
  const inputVector = new Vector3({ x: 2, y: 3, z: 5 });
  const m = new Matrix44({
    type: "rotate",
    angle: 0.5 * Math.PI,
    vector: new Vector3({ x: 0, y: 0, z: 1 }),
  });
  const rotatedVector: Vector3 = m.dot(inputVector);
  expect(rotatedVector.x).toBeCloseTo(-3, RESIDUAL);
  expect(rotatedVector.y).toBeCloseTo(2, RESIDUAL);
  expect(rotatedVector.z).toBeCloseTo(5, RESIDUAL);
});
