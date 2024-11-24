import { getElementUnwrap } from "../../shared/dom";
import { getContext, WebGLContext } from "../../shared/webgl/context";

const canvasId = "canvas";
const canvas = getElementUnwrap(canvasId) as HTMLCanvasElement;
const gl: WebGLContext = getContext(canvas);
(function () {
  const r = 0.6627450980392157;
  const g = 0.807843137254902;
  const b = 0.9254901960784314;
  const a = 0.75;
  gl.clearColor(r, g, b, a);
})();
gl.clear(gl.COLOR_BUFFER_BIT);
