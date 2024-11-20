import { getCanvasElement, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Angle, Counter, Timer } from "./util";

// arbitrary routine to give a point sprite
function setPositions(
  canvas: HTMLCanvasElement,
  arg: number,
  nitems: number,
  positions: Float32Array,
) {
  const w: number = canvas.width;
  const h: number = canvas.height;
  const r: number = 0.375 * Math.min(w, h);
  for (let i = 0; i < nitems; i++) {
    const t: number = (2 * Math.PI * i) / nitems + arg;
    positions[2 * i + 0] = 0.5 * w + r * Math.cos(t);
    positions[2 * i + 1] = 0.5 * h + r * Math.sin(t);
  }
}

window.addEventListener("load", () => {
  // main canvas
  const canvasId = "canvas";
  const canvas: HTMLCanvasElement = getCanvasElement(canvasId);
  // point sprite and buffer to store it
  const nitems = 32;
  const positions = new Float32Array(nitems * 2);
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(canvas, positions);
  // main draw
  const angle = new Angle(0.01);
  const counter = new Counter();
  const timer = new Timer(1000);
  function draw() {
    setPositions(canvas, angle.get(), nitems, positions);
    webGLObjects.draw(nitems, positions);
    angle.update();
    counter.update();
    if (timer.elapsed()) {
      console.log(
        `${counter.get().toString()} animation loops per ${timer.increment.toString()} ms`,
      );
      counter.reset();
      timer.start();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", () => {
    syncCanvasSize(canvas);
    setPositions(canvas, angle.get(), nitems, positions);
    webGLObjects.handleResizeEvent(canvas);
  });
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent(canvas);
  timer.start();
  draw();
});
