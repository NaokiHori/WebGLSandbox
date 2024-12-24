import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Timer } from "../../shared/util/timer";
import { Counter } from "../../shared/util/counter";
import { Matrix44 } from "../../shared/linearAlgebra/matrix44";
import { Vector3 } from "../../shared/linearAlgebra/vector3";

function initParticles(nitems: number): {
  positions: Float32Array;
  colors: Float32Array;
} {
  const factor = 1;
  const positions = new Array<number[]>();
  const colors = new Array<number[]>();
  for (let i = 0; i < nitems; i++) {
    const x = 2 * factor * (Math.random() - 0.5);
    const y = 2 * factor * (Math.random() - 0.5);
    const z = 2 * factor * (Math.random() - 0.5);
    const position = [x, y, z];
    positions.push(position);
    const r = x < 0 ? 1 : 1;
    const g = x < 0 ? 1 : 0;
    const b = x < 0 ? 0 : 1;
    colors.push([r, g, b]);
  }
  return {
    positions: new Float32Array(positions.flat()),
    colors: new Float32Array(colors.flat()),
  };
}

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // initialize points
  const nitems = 1 << 17;
  console.log(`${nitems.toString()} particles are present`);
  const {
    positions,
    colors,
  }: { positions: Float32Array; colors: Float32Array } = initParticles(nitems);
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(canvas, positions, colors);
  // performance checker
  const timer = new Timer(1000, () => {
    /* nothing to do for now */
  });
  const counter = new Counter();
  function draw() {
    const rotationMatrix = new Matrix44({
      type: "rotate",
      angle: 0.01 * counter.get(),
      vector: new Vector3({ x: 1, y: 0, z: 0 }),
    });
    webGLObjects.draw(nitems, rotationMatrix);
    timer.update();
    counter.update();
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", () => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent();
  });
  // main draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  timer.start();
  counter.reset();
  draw();
});
