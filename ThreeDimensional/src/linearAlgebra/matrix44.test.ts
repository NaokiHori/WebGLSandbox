import { expect, test } from "vitest";
import { Matrix44 } from "./matrix44";

test("Matrix44 constructor, zero matrix", () => {
  const m = new Matrix44({ type: "zero" });
  const elements = m.flat();
  for (const elem of elements) {
    expect(elem).toBe(0);
  }
});
