import { getCanvasElement, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";

function getInputElement(id: string): HTMLInputElement {
  const elem: HTMLElement | null = document.getElementById(id);
  if (null === elem) {
    throw new Error(`failed to get element: ${id}`);
  }
  return elem as HTMLInputElement;
}

window.addEventListener("load", () => {
  // main canvas
  const canvasId = "canvas";
  const canvas: HTMLCanvasElement = getCanvasElement(canvasId);
  // input
  const refPoint: [number, number] = [0, 0];
  const controllers: [HTMLInputElement, HTMLInputElement] = [
    getInputElement("ref-x-controller"),
    getInputElement("ref-y-controller"),
  ];
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(canvas);
  function draw() {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent(canvas);
    webGLObjects.handleInputEvent(refPoint);
    webGLObjects.draw();
  }
  draw();
  window.addEventListener("resize", () => {
    draw();
  });
  controllers.forEach((controller: HTMLInputElement, index: number) => {
    controller.addEventListener("input", () => {
      refPoint[index] = Number(controller.value);
      draw();
    });
  });
});
