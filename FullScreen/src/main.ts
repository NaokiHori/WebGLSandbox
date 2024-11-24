import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";

window.addEventListener("load", () => {
  // main canvas
  const canvasId = "canvas";
  const canvas = getElementUnwrap(canvasId) as HTMLCanvasElement;
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(canvas);
  function draw() {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent(canvas);
    webGLObjects.draw();
  }
  // initial draw
  draw();
  // draw on resize window
  window.addEventListener("resize", () => {
    draw();
  });
});
