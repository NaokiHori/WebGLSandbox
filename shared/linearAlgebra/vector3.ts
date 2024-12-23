export class Vector3 {
  private _data: number[];

  public constructor({ x, y, z }: { x: number; y: number; z: number }) {
    this._data = [x, y, z];
  }

  public norm(): number {
    const x2: number = Math.pow(this._data[0], 2);
    const y2: number = Math.pow(this._data[1], 2);
    const z2: number = Math.pow(this._data[2], 2);
    return Math.sqrt(x2 + y2 + z2);
  }

  public normalize(): Vector3 {
    const norm: number = this.norm();
    if (norm < Number.EPSILON) {
      throw new Error("cannot normalize zero vector");
    }
    return new Vector3({
      x: this.x / norm,
      y: this.y / norm,
      z: this.z / norm,
    });
  }

  public multiply(v: number): Vector3 {
    return new Vector3({
      x: v * this.x,
      y: v * this.y,
      z: v * this.z,
    });
  }

  public add(v: Vector3): Vector3 {
    return new Vector3({
      x: this.x + v.x,
      y: this.y + v.y,
      z: this.z + v.z,
    });
  }

  public dot(v: Vector3): number {
    const xProd = this.x * v.x;
    const yProd = this.y * v.y;
    const zProd = this.z * v.z;
    return xProd + yProd + zProd;
  }

  public cross(v: Vector3): Vector3 {
    return new Vector3({
      x: this.y * v.z - this.z * v.y,
      y: this.z * v.x - this.x * v.z,
      z: this.x * v.y - this.y * v.x,
    });
  }

  public get x(): number {
    return this._data[0];
  }

  public get y(): number {
    return this._data[1];
  }

  public get z(): number {
    return this._data[2];
  }

  public flat(): number[] {
    return this._data;
  }
}
