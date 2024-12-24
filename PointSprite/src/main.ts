import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Angle } from "./angle";
import { Timer } from "../../shared/util/timer";

// create a point sprite
function setPositions(
  minLength: number,
  arg: number,
  nitems: number,
  positions: Float32Array,
) {
  const radius = 0.75 * minLength;
  for (let i = 0; i < nitems; i++) {
    const angle: number = (2 * Math.PI * i) / nitems + arg;
    positions[2 * i + 0] = radius * Math.cos(angle);
    positions[2 * i + 1] = radius * Math.sin(angle);
  }
}

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // point sprite and buffer to store it
  const nitems = 32;
  const positions = new Float32Array(nitems * "xy".length);
  // NOTE: the shorter one of "screen width" "screen height" is fixed to this value
  const minLength = 16;
  // diameter
  const pointSize = 1;
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(
    canvas,
    minLength,
    pointSize,
    positions,
  );
  const angle = new Angle(0.01);
  // performance checker
  const timer = new Timer(1000, () => {
    /* nothing to do for now */
  });
  function draw() {
    setPositions(minLength, angle.getCurrentValue(), nitems, positions);
    webGLObjects.draw(nitems, positions);
    angle.update();
    timer.update();
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", () => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent();
  });
  // start rendering loop
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  timer.start();
  draw();
});
