import { syncCanvasSize, getElementUnwrap } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { PointerEventHandler } from "./pointerEventHandler";

function getAspectRatio(canvas: HTMLCanvasElement): number {
  return canvas.width / canvas.height;
}

function isPositiveNumber(str: string): boolean {
  const num = Number(str);
  if (Number.isNaN(num)) {
    return false;
  }
  if (num <= 0) {
    return false;
  }
  return true;
}

window.addEventListener("load", () => {
  // main canvas
  const canvasId = "canvas";
  const canvas = getElementUnwrap(canvasId) as HTMLCanvasElement;
  // main drawer
  const webGLObjects = new WebGLObjects(canvas);
  // rotate model on pointer movement
  const pointerEventHandler = new PointerEventHandler(
    canvas,
    webGLObjects,
    getAspectRatio,
  );
  // change scale
  const scaleText = getElementUnwrap("scale-text") as HTMLInputElement;
  // change light configuration
  const diffuseLightCheckbox = getElementUnwrap(
    "diffuse-light-checkbox",
  ) as HTMLInputElement;
  const ambientLightCheckbox = getElementUnwrap(
    "ambient-light-checkbox",
  ) as HTMLInputElement;
  scaleText.addEventListener("input", () => {
    const value = scaleText.value;
    if (!isPositiveNumber(value)) {
      scaleText.setAttribute("isvalid", "false");
      return;
    }
    scaleText.setAttribute("isvalid", "true");
    webGLObjects.updateScale(Number(value));
    webGLObjects.draw(
      pointerEventHandler.rotationMatrix,
      getAspectRatio(canvas),
    );
  });
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
  // rescale model and screen on resize event
  window.addEventListener("resize", () => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent(canvas);
    webGLObjects.draw(
      pointerEventHandler.rotationMatrix,
      getAspectRatio(canvas),
    );
  });
  // initial draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent(canvas);
  webGLObjects.draw(pointerEventHandler.rotationMatrix, getAspectRatio(canvas));
});
