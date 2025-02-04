import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Timer } from "../../shared/util/timer";

window.addEventListener("load", (): void => {
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  const webGLObjects = new WebGLObjects(canvas);
  const timer = new Timer(1000, () => {
    /* nothing to do */
  });
  window.addEventListener("resize", () => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent(canvas);
  });
  function draw() {
    let time = 0;
    for (;;) {
      const dt: number = webGLObjects.update();
      time += dt;
      if (0.1 < time) {
        break;
      }
    }
    webGLObjects.draw(canvas);
    timer.update();
    requestAnimationFrame(draw);
  }
  timer.start();
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent(canvas);
  draw();
});
