import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // set-up webgl-related stuffs
  WebGLObjects.setup(canvas)
    .then((webGLObjects: WebGLObjects) => {
      window.addEventListener("resize", () => {
        syncCanvasSize(canvas);
        webGLObjects.handleResizeEvent();
        webGLObjects.draw();
      });
      syncCanvasSize(canvas);
      webGLObjects.handleResizeEvent();
      webGLObjects.draw();
    })
    .catch((error: unknown) => {
      if (error instanceof Error) {
        console.error(error);
      } else {
        throw error;
      }
    });
});
