import { syncCanvasSize, getElementUnwrap } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { PointerEventHandler } from "./pointerEventHandler";

function getAspectRatio(canvas: HTMLCanvasElement): number {
  return canvas.width / canvas.height;
}

function getTwoCoprimeIntegers(): [number, number] {
  const primeNumbers = [2, 3, 5, 7];
  for (;;) {
    const number0 =
      primeNumbers[Math.floor(primeNumbers.length * Math.random())];
    const number1 =
      primeNumbers[Math.floor(primeNumbers.length * Math.random())];
    if (number0 !== number1) {
      return [number0, number1];
    }
  }
}

window.addEventListener("load", () => {
  // main canvas
  const canvasId = "canvas";
  const canvas = getElementUnwrap(canvasId) as HTMLCanvasElement;
  // main drawer
  const webGLObjects = new WebGLObjects(canvas, getTwoCoprimeIntegers());
  // rotate model on pointer movement
  const pointerEventHandler = new PointerEventHandler(
    canvas,
    webGLObjects,
    getAspectRatio,
  );
  // change light configuration
  const diffuseLightCheckbox = getElementUnwrap(
    "diffuse-light-checkbox",
  ) as HTMLInputElement;
  const ambientLightCheckbox = getElementUnwrap(
    "ambient-light-checkbox",
  ) as HTMLInputElement;
  const specularLightCheckbox = getElementUnwrap(
    "specular-light-checkbox",
  ) as HTMLInputElement;
  diffuseLightCheckbox.addEventListener("change", () => {
    webGLObjects.toggleDiffuseLight();
    webGLObjects.draw(
      pointerEventHandler.rotationMatrix,
      getAspectRatio(canvas),
    );
  });
  ambientLightCheckbox.addEventListener("change", () => {
    webGLObjects.toggleAmbientLight();
    webGLObjects.draw(
      pointerEventHandler.rotationMatrix,
      getAspectRatio(canvas),
    );
  });
  specularLightCheckbox.addEventListener("change", () => {
    webGLObjects.toggleSpecularLight();
    webGLObjects.draw(
      pointerEventHandler.rotationMatrix,
      getAspectRatio(canvas),
    );
  });
  // rescale model and screen on resize event
  window.addEventListener("resize", () => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent();
    webGLObjects.draw(
      pointerEventHandler.rotationMatrix,
      getAspectRatio(canvas),
    );
  });
  // zoom on wheel
  (function initalizeWheelEvent() {
    let scale = 1;
    const minScale = 2e-1;
    const maxScale = 5e1;
    window.addEventListener("wheel", (event: WheelEvent) => {
      event.preventDefault();
      scale = Math.max(
        minScale,
        Math.min(maxScale, scale - event.deltaY * 0.005),
      );
      webGLObjects.updateScale(scale);
      webGLObjects.draw(
        pointerEventHandler.rotationMatrix,
        getAspectRatio(canvas),
      );
    });
  })();
  // initial draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  webGLObjects.draw(pointerEventHandler.rotationMatrix, getAspectRatio(canvas));
});
