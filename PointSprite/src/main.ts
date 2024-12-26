import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { ClampedValue } from "../../shared/util/clampedValue";
import { Timer } from "../../shared/util/timer";

// create a point sprite
function setPositions(
  minLength: number,
  angleOffset: number,
  numberOfVertices: number,
  positions: Float32Array,
) {
  const radius = 0.75 * minLength;
  for (let i = 0; i < numberOfVertices; i++) {
    const angle: number = (2 * Math.PI * i) / numberOfVertices + angleOffset;
    positions[2 * i + 0] = radius * Math.cos(angle);
    positions[2 * i + 1] = radius * Math.sin(angle);
  }
}

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // point sprite and buffer to store it
  const numberOfVertices = 32;
  const numberOfItemsForEachVertex = "xy".length;
  const positions = new Float32Array(
    numberOfVertices * numberOfItemsForEachVertex,
  );
  // NOTE: the shorter one of "screen width" "screen height" is fixed to this value
  const minLength = 16;
  // diameter
  const pointSize = 1;
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(
    canvas,
    numberOfVertices,
    numberOfItemsForEachVertex,
    minLength,
    pointSize,
  );
  const angleOffset = new ClampedValue({
    isPeriodic: true,
    minValue: 0,
    maxValue: 2 * Math.PI,
    defaultValue: 0.01,
  });
  // performance checker
  const timer = new Timer(1000, () => {
    /* nothing to do for now */
  });
  function draw() {
    setPositions(minLength, angleOffset.get(), numberOfVertices, positions);
    webGLObjects.draw(positions);
    angleOffset.update(angleOffset.get() + 0.01);
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
