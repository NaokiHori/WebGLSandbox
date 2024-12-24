import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { Timer } from "../../shared/util/timer";
import { WebGLObjects } from "./webgl";
import { ClampedValue } from "./clampedValue";
import { PointerEvents } from "./pointerEvents";
import { Toggle } from "./toggle";
import { Lissajous } from "./lissajous";
import { savePPMImage } from "../../shared/savePPMImage";

function handleWindowResizeEvent(
  canvas: HTMLCanvasElement,
  webGLObjects: WebGLObjects,
) {
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
}

function handleWindowWheelEvent(
  event: WheelEvent,
  domainSize: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  event.preventDefault();
  domainSize.update(domainSize.get() + event.deltaY * 0.005);
  webGLObjects.handleMoveEvent(domainSize);
}

function handleCanvasPointerEvents(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  domainSize: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  event.preventDefault();
  const isBottomHalf = event.clientY / canvas.height < 0.5;
  domainSize.update(domainSize.get() + (isBottomHalf ? -0.1 : +0.1));
  webGLObjects.handleMoveEvent(domainSize);
}

function handleDocumentKeyDownS(webGLObjects: WebGLObjects) {
  if (new URLSearchParams(window.location.search).has("savePPMImage")) {
    const { width, height, pixelData } = webGLObjects.getPixelData();
    savePPMImage({ fileName: "image.ppm", width, height, pixelData });
  }
}

function handleDocumentKeyDownP(isPaused: Toggle) {
  isPaused.update();
}

function handleDocumentKeyDownArrowDown(timeStepFactor: ClampedValue) {
  timeStepFactor.update(timeStepFactor.get() * 0.95);
}

function handleDocumentKeyDownArrowUp(timeStepFactor: ClampedValue) {
  timeStepFactor.update(timeStepFactor.get() * 1.05);
}

function handleDocumentKeyDownArrowLeft(movesForwardInTime: Toggle) {
  movesForwardInTime.update(false);
}

function handleDocumentKeyDownArrowRight(movesForwardInTime: Toggle) {
  movesForwardInTime.update(true);
}

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // set-up webgl-related stuffs
  const domainSize = new ClampedValue({
    minValue: 1,
    maxValue: 5,
    defaultValue: 2,
  });
  const lissajousRef = new Lissajous(0.6, Math.sqrt(0.0002));
  const lissajousOrig = new Lissajous(3, Math.sqrt(0.0005));
  const webGLObjects = new WebGLObjects(canvas, domainSize);
  // performance checker
  const timer = new Timer(1000, () => {
    /* do nothing for now */
  });
  window.addEventListener("resize", () => {
    handleWindowResizeEvent(canvas, webGLObjects);
  });
  window.addEventListener("wheel", (event: WheelEvent) => {
    handleWindowWheelEvent(event, domainSize, webGLObjects);
  });
  new PointerEvents(canvas, (event: MouseEvent) => {
    handleCanvasPointerEvents(event, canvas, domainSize, webGLObjects);
  });
  const isPaused = new Toggle({
    defaultState: false,
    onEnabled: () => {
      /* do nothing for now */
    },
    onDisabled: () => {
      /* do nothing for now */
    },
  });
  const timeStepFactor = new ClampedValue({
    minValue: 0.1,
    maxValue: 10,
    defaultValue: 1,
  });
  const movesForwardInTime = new Toggle({
    defaultState: true,
    onEnabled: () => {
      /* do nothing for now */
    },
    onDisabled: () => {
      /* do nothing for now */
    },
  });
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const key: string = event.key;
    if ("s" === key) {
      handleDocumentKeyDownS(webGLObjects);
    } else if ("p" === key) {
      handleDocumentKeyDownP(isPaused);
    } else if ("ArrowDown" === key) {
      handleDocumentKeyDownArrowDown(timeStepFactor);
    } else if ("ArrowUp" === key) {
      handleDocumentKeyDownArrowUp(timeStepFactor);
    } else if ("ArrowLeft" === key) {
      handleDocumentKeyDownArrowLeft(movesForwardInTime);
    } else if ("ArrowRight" === key) {
      handleDocumentKeyDownArrowRight(movesForwardInTime);
    }
  });
  function draw() {
    const currentTimeStepFactor: number = (function getCurrentTimeStepFactor() {
      let currentTimeStepFactor = timeStepFactor.get();
      if (isPaused.getCurrentState()) {
        return 0;
      }
      if (!movesForwardInTime.getCurrentState()) {
        currentTimeStepFactor *= -1;
      }
      return currentTimeStepFactor;
    })();
    lissajousRef.update(currentTimeStepFactor);
    lissajousOrig.update(currentTimeStepFactor);
    webGLObjects.draw(lissajousRef.get(), lissajousOrig.get());
    timer.update();
    requestAnimationFrame(draw);
  }
  timer.start();
  handleWindowResizeEvent(canvas, webGLObjects);
  draw();
});
