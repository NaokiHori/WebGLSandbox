import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Timer } from "../../shared/util/timer";
import { Counter } from "../../shared/util/counter";
import { Vector3 } from "../../shared/linearAlgebra/vector3";
import { ClampedValue } from "../../shared/util/clampedValue";
import { Toggle } from "../../shared/util/toggle";
import { saveJPEGImage } from "../../shared/saveJPEGImage";

function convertHslToRgb(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = 6 * h;
  const x = c * (1 - Math.abs(hp % 2));
  const [rp, gp, bp] = (function () {
    if (hp < 1) {
      return [c, x, 0];
    } else if (hp < 2) {
      return [x, c, 0];
    } else if (hp < 3) {
      return [0, c, x];
    } else if (hp < 4) {
      return [0, x, c];
    } else if (hp < 5) {
      return [x, 0, c];
    } else {
      return [c, 0, x];
    }
  })();
  const m = l - 0.5 * c;
  return [rp + m, gp + m, bp + m];
}

function initParticles(nitems: number): {
  positions: Float32Array;
  colors: Float32Array;
} {
  const factor = 0.01;
  const positions = new Array<number[]>();
  const colors = new Array<number[]>();
  for (let i = 0; i < nitems; i++) {
    const x = 2 * (Math.random() - 0.5);
    const y = 2 * (Math.random() - 0.5);
    const z = 2 * (Math.random() - 0.5);
    const position = [factor * x, factor * y, factor * z];
    positions.push(position);
    const h = 0.5 * (x * y + 1);
    const s = 1;
    const l = 0.8;
    const [r, g, b] = convertHslToRgb(h, s, l);
    colors.push([r, g, b]);
  }
  return {
    positions: new Float32Array(positions.flat()),
    colors: new Float32Array(colors.flat()),
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
  webGLObjects.handleWheelEvent(cameraPositionZ.get());
}

function handleDocumentKeyDownP(isPaused: Toggle, webGLObjects: WebGLObjects) {
  isPaused.update();
  webGLObjects.updateIsPaused(isPaused.getCurrentState());
}

function handleDocumentKeyDownArrowDown(
  clampedValue: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  clampedValue.update(clampedValue.get() - 1);
  webGLObjects.updateLorenzSigma(clampedValue.get());
}

function handleDocumentKeyDownArrowUp(
  clampedValue: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  clampedValue.update(clampedValue.get() + 1);
  webGLObjects.updateLorenzSigma(clampedValue.get());
}

function handleDocumentKeyDownArrowLeft(
  clampedValue: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  clampedValue.update(clampedValue.get() - 1);
  webGLObjects.updateLorenzRho(clampedValue.get());
}

function handleDocumentKeyDownArrowRight(
  clampedValue: ClampedValue,
  webGLObjects: WebGLObjects,
) {
  clampedValue.update(clampedValue.get() + 1);
  webGLObjects.updateLorenzRho(clampedValue.get());
}

function handleDocumentKeyDownS(canvas: HTMLCanvasElement, fileName: string) {
  saveJPEGImage(canvas, fileName);
}

window.addEventListener("load", () => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // initialize points
  const nitems = 1 << 16;
  console.log(`${nitems.toString()} particles are present`);
  const {
    positions,
    colors,
  }: { positions: Float32Array; colors: Float32Array } = initParticles(nitems);
  // set-up webgl-related stuffs
  const cameraPositionZ = new ClampedValue({
    minValue: 1,
    maxValue: 10,
    defaultValue: 6,
  });
  const lorenzParameters = {
    sigma: new ClampedValue({
      minValue: 1,
      maxValue: 100,
      defaultValue: 10,
    }),
    rho: new ClampedValue({
      minValue: 1,
      maxValue: 100,
      defaultValue: 28,
    }),
  };
  const webGLObjects = new WebGLObjects(
    canvas,
    positions,
    colors,
    cameraPositionZ.get(),
    lorenzParameters.sigma.get(),
    lorenzParameters.rho.get(),
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
    const sigma = lorenzParameters.sigma.get();
    const rho = lorenzParameters.rho.get();
    console.log(
      `  Lorenz parameters: (sigma: ${sigma.toString()}, rho: ${rho.toString()})`,
    );
  });
  const rotationVector = new Vector3({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
  }).normalize();
  const counter = new Counter();
  function draw() {
    const rotationAngle = 0.01 * counter.get();
    webGLObjects.draw(nitems, rotationVector, rotationAngle);
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
    } else if ("ArrowDown" === key) {
      handleDocumentKeyDownArrowDown(lorenzParameters.sigma, webGLObjects);
    } else if ("ArrowUp" === key) {
      handleDocumentKeyDownArrowUp(lorenzParameters.sigma, webGLObjects);
    } else if ("ArrowLeft" === key) {
      handleDocumentKeyDownArrowLeft(lorenzParameters.rho, webGLObjects);
    } else if ("ArrowRight" === key) {
      handleDocumentKeyDownArrowRight(lorenzParameters.rho, webGLObjects);
    }
  });
  // main draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  timer.start();
  counter.reset();
  draw();
});
