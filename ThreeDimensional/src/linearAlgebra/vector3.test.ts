import { expect, test } from "vitest";
import { Vector3 } from "./vector3";

const RESIDUAL = 8;

test("Vector3 constructor and getter", () => {
  const x = 0;
  const y = 1;
  const z = 2;
  const v = new Vector3({ x, y, z });
  expect(v.x).toBe(x);
  expect(v.y).toBe(y);
  expect(v.z).toBe(z);
});

test("Vector3.flat", () => {
  const x = Math.random() - 0.5;
  const y = Math.random() - 0.5;
  const z = Math.random() - 0.5;
  const v = new Vector3({ x, y, z });
  expect(v.flat()).toStrictEqual([x, y, z]);
});

test("Vector3.norm", () => {
  const x = 3;
  const y = 4;
  const z = 12;
  const v = new Vector3({ x, y, z });
  expect(v.norm()).toBeCloseTo(13, RESIDUAL);
});

test("Vector3.normalize, normal case", () => {
  const x = 3.14;
  const y = 1.41;
  const z = 1.73;
  const v = new Vector3({ x, y, z });
  expect(v.normalize().norm()).toBeCloseTo(1, RESIDUAL);
});

test("Vector3.normalize, edge case", () => {
  const x = 0;
  const y = 0;
  const z = 0;
  const v = new Vector3({ x, y, z });
  expect(() => v.normalize()).toThrowError("zero vector");
});

test("Vector3.multiply", () => {
  const x = Math.random() - 0.5;
  const y = Math.random() - 0.5;
  const z = Math.random() - 0.5;
  const v = new Vector3({ x, y, z });
  const multipliedV = v.multiply(2);
  expect(multipliedV.x).toBeCloseTo(2 * x, RESIDUAL);
  expect(multipliedV.y).toBeCloseTo(2 * y, RESIDUAL);
  expect(multipliedV.z).toBeCloseTo(2 * z, RESIDUAL);
});

test("Vector3.add", () => {
  const x0 = Math.random() - 0.5;
  const y0 = Math.random() - 0.5;
  const z0 = Math.random() - 0.5;
  const x1 = Math.random() - 0.5;
  const y1 = Math.random() - 0.5;
  const z1 = Math.random() - 0.5;
  const v0 = new Vector3({ x: x0, y: y0, z: z0 });
  const v1 = new Vector3({ x: x1, y: y1, z: z1 });
  const addedV = v0.add(v1);
  expect(addedV.x).toBeCloseTo(x0 + x1, RESIDUAL);
  expect(addedV.y).toBeCloseTo(y0 + y1, RESIDUAL);
  expect(addedV.z).toBeCloseTo(z0 + z1, RESIDUAL);
});

test("Vector3.dot", () => {
  const x0 = Math.random() - 0.5;
  const y0 = Math.random() - 0.5;
  const z0 = Math.random() - 0.5;
  const x1 = Math.random() - 0.5;
  const y1 = Math.random() - 0.5;
  const z1 = Math.random() - 0.5;
  const v0 = new Vector3({ x: x0, y: y0, z: z0 });
  const v1 = new Vector3({ x: x1, y: y1, z: z1 });
  const innerProduct = v0.dot(v1);
  expect(innerProduct).toBeCloseTo(x0 * x1 + y0 * y1 + z0 * z1, RESIDUAL);
});

test("Vector3.cross", () => {
  const x0 = Math.random() - 0.5;
  const y0 = Math.random() - 0.5;
  const z0 = Math.random() - 0.5;
  const x1 = Math.random() - 0.5;
  const y1 = Math.random() - 0.5;
  const z1 = Math.random() - 0.5;
  const v0 = new Vector3({ x: x0, y: y0, z: z0 });
  const v1 = new Vector3({ x: x1, y: y1, z: z1 });
  const outerProduct = v0.cross(v1);
  expect(outerProduct.x).toBeCloseTo(y0 * z1 - z0 * y1, RESIDUAL);
  expect(outerProduct.y).toBeCloseTo(z0 * x1 - x0 * z1, RESIDUAL);
  expect(outerProduct.z).toBeCloseTo(x0 * y1 - y0 * x1, RESIDUAL);
});
