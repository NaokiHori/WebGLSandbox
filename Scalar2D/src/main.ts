import { getElementUnwrap, syncCanvasSize } from "../../shared/dom";
import { WebGLObjects } from "./webgl";
import { Timer } from "../../shared/util/timer";
import { Counter } from "../../shared/util/counter";

function setScalarField(
  counter: Counter,
  xOffsets: number[],
  yOffsets: number[],
  nScalarFields: number,
  scalarLengths: [number, number],
  scalarGridPoints: [number, number],
  scalarField: Uint8Array,
) {
  const dx = scalarLengths[0] / scalarGridPoints[0];
  const dy = scalarLengths[1] / scalarGridPoints[1];
  const xFreqs = [1, 2, 3];
  const yFreqs = [1, 2, 3];
  const cntr: number = counter.get();
  for (let k = 0; k < nScalarFields; k++) {
    const xFreq = xFreqs[k];
    const yFreq = yFreqs[k];
    const xOffset = xOffsets[k] * cntr;
    const yOffset = yOffsets[k] * cntr;
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
  // toggle linear interpolation
  const linearInterpolationInput = getElementUnwrap(
    "linear-interpolation-checkbox",
  ) as HTMLInputElement;
  // create two-dimensional scalar fields to be superposed
  // NOTE: aspect ratios should be identical
  const nScalarFields = 3;
  const xOffsets = [
    0.25 * (Math.random() - 0.5),
    0.25 * (Math.random() - 0.5),
    0.25 * (Math.random() - 0.5),
  ];
  const yOffsets = [
    0.25 * (Math.random() - 0.5),
    0.25 * (Math.random() - 0.5),
    0.25 * (Math.random() - 0.5),
  ];
  const scalarLengths: [number, number] = [2, 1];
  const scalarGridPoints: [number, number] = [64, 32];
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
  // switch on / off linear interpolation on checkbox clicked
  linearInterpolationInput.addEventListener("change", (): void => {
    webGLObjects.handleChangeEvent();
  });
  const timer = new Timer(1000, () => {
    /* nothing to do for now */
  });
  const counter = new Counter();
  function draw() {
    setScalarField(
      counter,
      xOffsets,
      yOffsets,
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
