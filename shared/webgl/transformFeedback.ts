import { VertexBufferObject } from "./vertexBufferObject";

export class TransformFeedback {
  private _transformFeedback: WebGLTransformFeedback;

  public constructor({ gl }: { gl: WebGL2RenderingContext }) {
    const transformFeedback: WebGLTransformFeedback =
      gl.createTransformFeedback();
    this._transformFeedback = transformFeedback;
  }

  public bindBufferBaseAndExecute({
    gl,
    vertexBufferObject,
    callback,
  }: {
    gl: WebGL2RenderingContext;
    vertexBufferObject: VertexBufferObject;
    callback: (boundTransformFeedback: TransformFeedback) => void;
  }) {
    const transformFeedback: WebGLTransformFeedback = this._transformFeedback;
    const transformFeedbackTarget: GLenum = gl.TRANSFORM_FEEDBACK;
    const bufferBaseTarget: GLenum = gl.TRANSFORM_FEEDBACK_BUFFER;
    gl.bindTransformFeedback(transformFeedbackTarget, transformFeedback);
    gl.bindBufferBase(bufferBaseTarget, 0, vertexBufferObject.buffer);
    callback(this);
    gl.bindBufferBase(bufferBaseTarget, 0, null);
    gl.bindTransformFeedback(transformFeedbackTarget, null);
  }
}
