import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Timer } from "../../shared/util/timer";

function setScalarField(
  cntr: number,
  scalarWidth: number,
  scalarHeight: number,
  scalarField: Float32Array,
) {
  const xFreq = 4;
  const yFreq = 2;
  for (let j = 0; j < scalarHeight; j++) {
    const yComp =
      0.5 +
      0.5 * Math.sin((2 * Math.PI * yFreq * j) / scalarHeight + 0.05 * cntr);
    for (let i = 0; i < scalarWidth; i++) {
      const xComp =
        0.5 +
        0.5 * Math.sin((2 * Math.PI * xFreq * i) / scalarWidth + 0.15 * cntr);
      scalarField[j * scalarWidth + i] = xComp * yComp;
    }
  }
}

window.addEventListener("load", (): void => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // create a two-dimensional scalar field
  const scalarWidth = 256;
  const scalarHeight = 128;
  const scalarField = new Float32Array(scalarWidth * scalarHeight);
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(
    canvas,
    scalarWidth,
    scalarHeight,
    scalarField,
  );
  // draw on resize window
  window.addEventListener("resize", (): void => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent();
  });
  const timer = new Timer(1000, () => {
    /* nothing to do for now */
  });
  let cntr = 0;
  function draw() {
    setScalarField(cntr, scalarWidth, scalarHeight, scalarField);
    webGLObjects.draw();
    timer.update();
    cntr += 1;
    requestAnimationFrame(draw);
  }
  // initial draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  timer.start();
  draw();
});
