import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Timer } from "../../shared/util/timer";
import { Counter } from "../../shared/util/counter";

function setScalarField(
  counter: Counter,
  nScalarFields: number,
  scalarLengths: [number, number],
  scalarGridPoints: [number, number],
  scalarField: Uint8Array,
) {
  const dx = scalarLengths[0] / scalarGridPoints[0];
  const dy = scalarLengths[1] / scalarGridPoints[1];
  const xFreqs = [1, 2];
  const yFreqs = [1, 2];
  const xOffsets = [0.02 * counter.get(), -0.12 * counter.get()];
  const yOffsets = [0.06 * counter.get(), -0.05 * counter.get()];
  for (let k = 0; k < nScalarFields; k++) {
    const xFreq = xFreqs[k];
    const yFreq = yFreqs[k];
    const xOffset = xOffsets[k];
    const yOffset = yOffsets[k];
    for (let j = 0; j < scalarGridPoints[1]; j++) {
      const y = 0.5 * (2 * j + 1) * dy;
      const yComp = 0.5 + 0.5 * Math.sin(2 * Math.PI * yFreq * y + yOffset);
      for (let i = 0; i < scalarGridPoints[0]; i++) {
        const x = 0.5 * (2 * i + 1) * dx;
        const xComp = 0.5 + 0.5 * Math.sin(2 * Math.PI * xFreq * x + xOffset);
        const index = (k * scalarGridPoints[1] + j) * scalarGridPoints[0] + i;
        scalarField[index] = Math.floor(255 * (xComp * yComp));
      }
    }
  }
}

window.addEventListener("load", (): void => {
  // main canvas
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  // create a two-dimensional scalar field
  // NOTE: aspect ratios should be identical
  const nScalarFields = 2;
  const scalarLengths: [number, number] = [2, 1];
  const scalarGridPoints: [number, number] = [32, 16];
  const scalarField = new Uint8Array(
    scalarGridPoints[0] * scalarGridPoints[1] * nScalarFields,
  );
  // set-up webgl-related stuffs
  const webGLObjects = new WebGLObjects(
    canvas,
    nScalarFields,
    scalarGridPoints,
  );
  // draw on resize window
  window.addEventListener("resize", (): void => {
    syncCanvasSize(canvas);
    webGLObjects.handleResizeEvent();
  });
  const timer = new Timer(1000, () => {
    /* nothing to do for now */
  });
  const counter = new Counter();
  function draw() {
    setScalarField(
      counter,
      nScalarFields,
      scalarLengths,
      scalarGridPoints,
      scalarField,
    );
    webGLObjects.draw(scalarField);
    timer.update();
    counter.update();
    requestAnimationFrame(draw);
  }
  // initial draw
  syncCanvasSize(canvas);
  webGLObjects.handleResizeEvent();
  timer.start();
  counter.reset();
  draw();
});
