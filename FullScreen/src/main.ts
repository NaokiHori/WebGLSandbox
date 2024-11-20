import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";

window.addEventListener("load", (): void => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(canvas);
  // initial draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  webGLObjects.draw();
  // draw on resize window
  window.addEventListener("resize", (): void => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent();
    webGLObjects.draw();
  });
});
