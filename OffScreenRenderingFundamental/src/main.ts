import { getElementUnwrap } from "../../shared/dom";
import { WebGLObjects } from "./webgl";

window.addEventListener("load", (): void => {
  const canvas = getElementUnwrap("canvas") as HTMLCanvasElement;
  const webGLObjects = new WebGLObjects(canvas);
  webGLObjects.draw(canvas);
});
