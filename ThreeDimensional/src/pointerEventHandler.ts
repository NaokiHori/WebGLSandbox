import { Vector3 } from "../../shared/linearAlgebra/vector3";
import { Matrix44 } from "../../shared/linearAlgebra/matrix44";
import { WebGLObjects } from "./webgl";

function getCurrentPosition(event: PointerEvent): { x: number; y: number } {
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function getRotationAngle(rotationVector: Vector3): number {
  return 0.01 * rotationVector.norm();
}

export class PointerEventHandler {
  private _isPointerDown: boolean;
  private _pointerPosition: {
    s: {
      x: number;
      y: number;
    };
    e: {
      x: number;
      y: number;
    };
  };
  private _rotationMatrixNow: Matrix44;
  private _rotationMatrixAll: Matrix44;

  public constructor(
    canvas: HTMLCanvasElement,
    webGLObjects: WebGLObjects,
    getAspectRatio: (canvas: HTMLCanvasElement) => number,
  ) {
    this._isPointerDown = false;
    this._pointerPosition = {
      s: {
        x: 0,
        y: 0,
      },
      e: {
        x: 0,
        y: 0,
      },
    };
    // rotation matrices, initially no rotation
    //   all: stores entire history of rotation
    //   now: rotation from the latest pointerDown event to now
    this._rotationMatrixAll = new Matrix44({
      type: "rotate",
      angle: 0,
      vector: new Vector3({ x: 1, y: 0, z: 0 }),
    });
    this._rotationMatrixNow = new Matrix44({
      type: "rotate",
      angle: 0,
      vector: new Vector3({ x: 1, y: 0, z: 0 }),
    });
    canvas.addEventListener("pointerdown", (event: PointerEvent) => {
      // start tracking swiping motion
      this._isPointerDown = true;
      this._pointerPosition.s = getCurrentPosition(event);
    });
    canvas.addEventListener("pointermove", (event: PointerEvent) => {
      // decide rotation based on the swipe motion
      if (!this._isPointerDown) {
        return;
      }
      this._pointerPosition.e = getCurrentPosition(event);
      const rotationVector = new Vector3({
        x: this._pointerPosition.e.y - this._pointerPosition.s.y,
        y: this._pointerPosition.e.x - this._pointerPosition.s.x,
        z: 1.0e-8,
      });
      const rotationAngle = getRotationAngle(rotationVector);
      // rotation matrix due to this pointer event
      this._rotationMatrixNow = new Matrix44({
        type: "rotate",
        angle: rotationAngle,
        vector: rotationVector,
      });
      // the resulting model is determined as the superposition of the entire history and the latest event
      webGLObjects.draw(
        this._rotationMatrixNow.matmul(this._rotationMatrixAll),
        getAspectRatio(canvas),
      );
    });
    canvas.addEventListener("pointerup", () => {
      // now the current pointer event has been done
      // unify the last event to the history and update the "all" matrix
      this._rotationMatrixAll = this._rotationMatrixNow.matmul(
        this._rotationMatrixAll,
      );
      // sync current matrix, just in case
      this._rotationMatrixNow = this._rotationMatrixAll;
      this._isPointerDown = false;
    });
  }

  public get rotationMatrix(): Matrix44 {
    return this._rotationMatrixNow;
  }
}
