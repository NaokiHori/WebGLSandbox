import { createElement, getElementUnwrap } from "../../shared/dom";
import { WebGLObjects } from "./webgl";

function writeInputContents(
  index: number,
  items: Float32Array,
  element: HTMLDivElement,
) {
  let html = `<div>INPUT ${index.toString()}</div>`;
  html += '<ol start="0">';
  for (const item of items) {
    html += `<li>${item.toString()}</li>`;
  }
  html += "</ol>";
  element.innerHTML = html;
}

function writeOutputContents(
  nitems: number,
  input0: Float32Array,
  input1: Float32Array,
  output: Float32Array,
  element: HTMLDivElement,
) {
  let html = "<div>OUTPUT (comparison with the CPU result)</div>";
  html += '<ol start="0">';
  for (let n = 0; n < nitems; n += 1) {
    html += `<li>GPU: ${output[n].toString()}, CPU: ${(input0[n] + input1[n]).toString()}</li>`;
  }
  html += "</ol>";
  element.innerHTML = html;
}

window.addEventListener("load", () => {
  const nitems = 4;
  const input0 = new Float32Array(nitems);
  const input1 = new Float32Array(nitems);
  for (let n = 0; n < nitems; n++) {
    input0[n] = Math.random();
    input1[n] = Math.random();
  }
  const inputElement0 = getElementUnwrap("input0") as HTMLDivElement;
  const inputElement1 = getElementUnwrap("input1") as HTMLDivElement;
  writeInputContents(0, input0, inputElement0);
  writeInputContents(1, input1, inputElement1);
  //
  const canvas = createElement({ tagName: "canvas" }) as HTMLCanvasElement;
  const webGLObjects = new WebGLObjects(canvas, nitems);
  // "draw" call, computing sum of two buffers
  const output: Float32Array = webGLObjects.draw(nitems, input0, input1);
  const outputElement = getElementUnwrap("output") as HTMLDivElement;
  writeOutputContents(nitems, input0, input1, output, outputElement);
});
