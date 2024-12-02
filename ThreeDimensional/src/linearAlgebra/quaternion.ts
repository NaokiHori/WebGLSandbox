export class Quaternion {
  private _data: number[];

  public constructor({
    r,
    i,
    j,
    k,
  }: {
    r: number;
    i: number;
    j: number;
    k: number;
  }) {
    this._data = [r, i, j, k];
  }

  public norm(): number {
    let s = 0;
    for (const datum of this._data) {
      s += datum * datum;
    }
    return Math.sqrt(s);
  }

  public get r(): number {
    return this._data[0];
  }

  public get i(): number {
    return this._data[1];
  }

  public get j(): number {
    return this._data[2];
  }

  public get k(): number {
    return this._data[3];
  }
}
