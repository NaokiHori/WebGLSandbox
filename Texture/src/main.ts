import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";

function handleWindowResizeEvent(
  canvas: HTMLCanvasElement,
  webGLObjects: WebGLObjects,
) {
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  webGLObjects.draw();
}

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // set-up webgl-related stuffs
  WebGLObjects.setup(canvas)
    .then((webGLObjects: WebGLObjects) => {
      window.addEventListener("resize", () => {
        handleWindowResizeEvent(canvas, webGLObjects);
      });
      handleWindowResizeEvent(canvas, webGLObjects);
    })
    .catch((error: unknown) => {
      throw error;
    });
});
