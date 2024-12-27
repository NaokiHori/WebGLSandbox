import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Timer } from "../../shared/util/timer";
import { Counter } from "../../shared/util/counter";
import { Vector3 } from "../../shared/linearAlgebra/vector3";
import { ClampedValue } from "../../shared/util/clampedValue";
import { Toggle } from "../../shared/util/toggle";
import { saveJPEGImage } from "../../shared/saveJPEGImage";
import { PointerEvents } from "../../shared/pointerEvents";
import { genRange } from "../../shared/util/random";

function initParticles(nitems: number): {
  positions: Float32Array;
  colors: Float32Array;
  lorenzRhos: Float32Array;
} {
  const rhoMin = 42;
  const rhoMax = 98;
  const factor = 2 * rhoMax;
  const positions = new Float32Array(nitems * 3);
  const colors = new Float32Array(nitems * 3);
  const lorenzRhos = new Float32Array(nitems);
  for (let i = 0; i < nitems; i++) {
    const x = genRange({ minValue: -1, maxValue: 1 });
    const y = genRange({ minValue: -1, maxValue: 1 });
    const z = genRange({ minValue: -1, maxValue: 1 });
    positions[3 * i + 0] = factor * x;
    positions[3 * i + 1] = factor * y;
    positions[3 * i + 2] = factor * z;
    lorenzRhos[i] = rhoMin + (i / nitems) * (rhoMax - rhoMin);
    const r = Math.min(1, Math.max(0, (3 * i) / nitems - 0));
    const g = Math.min(1, Math.max(0, (3 * i) / nitems - 1));
    const b = Math.min(1, Math.max(0, (3 * i) / nitems - 2));
    colors[3 * i + 0] = r;
    colors[3 * i + 1] = g;
    colors[3 * i + 2] = b;
  }
  return {
    positions,
    colors,
    lorenzRhos,
  };
}

function handleWindowResizeEvent(
  canvas: HTMLCanvasElement,
  webGLObjects: WebGLObjects,
) {
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
}

function handleWindowWheelEvent(
  event: WheelEvent,
  cameraPositionZ: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  event.preventDefault();
  cameraPositionZ.update(cameraPositionZ.get() + event.deltaY * 0.005);
  webGLObjects.updateCameraPositionZ(cameraPositionZ.get());
}

function handleDocumentKeyDownP(isPaused: Toggle, webGLObjects: WebGLObjects) {
  isPaused.update();
  webGLObjects.updateIsPaused(isPaused.getCurrentState());
}

function handleDocumentKeyDownS(canvas: HTMLCanvasElement, fileName: string) {
  saveJPEGImage(canvas, fileName);
}

function handleCanvasPointerEvents(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  cameraPositionZ: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  event.preventDefault();
  const isBottomHalf = event.clientY / canvas.height < 0.5;
  cameraPositionZ.update(cameraPositionZ.get() + (isBottomHalf ? -0.1 : +0.1));
  webGLObjects.updateCameraPositionZ(cameraPositionZ.get());
}

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // initialize points
  const nitems = 1 << 17;
  console.log(`${nitems.toString()} particles are present`);
  const {
    positions,
    colors,
    lorenzRhos,
  }: {
    positions: Float32Array;
    colors: Float32Array;
    lorenzRhos: Float32Array;
  } = initParticles(nitems);
  // set-up webgl-related stuffs
  const cameraPositionZ = new ClampedValue({
    isPeriodic: false,
    minValue: 1,
    maxValue: 10,
    defaultValue: 6,
  });
  const webGLObjects = new WebGLObjects(
    canvas,
    nitems,
    positions,
    colors,
    lorenzRhos,
    cameraPositionZ.get(),
  );
  const isPaused = new Toggle({
    defaultState: false,
    onEnabled: () => {
      /* do nothing for now */
    },
    onDisabled: () => {
      /* do nothing for now */
    },
  });
  // performance checker
  const timer = new Timer(1000, () => {
    /* nothing to do for now */
  });
  const rotationVector = new Vector3({
    x: Math.random() - 0.5,
    y: Math.random() - 0.5,
    z: Math.random() - 0.5,
  }).normalize();
  const counter = new Counter();
  function draw() {
    const rotationAngle = 0.01 * counter.get();
    webGLObjects.draw(rotationVector, rotationAngle);
    timer.update();
    counter.update();
    requestAnimationFrame(draw);
  }
  window.addEventListener("resize", () => {
    handleWindowResizeEvent(canvas, webGLObjects);
  });
  window.addEventListener("wheel", (event: WheelEvent) => {
    handleWindowWheelEvent(event, cameraPositionZ, webGLObjects);
  });
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const key: string = event.key;
    if ("p" === key) {
      handleDocumentKeyDownP(isPaused, webGLObjects);
    } else if ("s" === key) {
      handleDocumentKeyDownS(canvas, "image.jpeg");
    }
  });
  new PointerEvents(canvas, (event: MouseEvent) => {
    handleCanvasPointerEvents(event, canvas, cameraPositionZ, webGLObjects);
  });
  // main draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  timer.start();
  counter.reset();
  draw();
});
