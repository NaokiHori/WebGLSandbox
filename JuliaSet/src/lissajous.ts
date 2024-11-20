interface Parameter {
  amp: number;
  a: number;
  b: number;
  c: number;
  d: number;
}

export class Lissajous {
  private _time: number;
  private _dt: number;
  private _parameter: Parameter;

  public constructor(domainSize: number, dt: number) {
    this._time = 0;
    this._dt = dt;
    this._parameter = {
      amp: domainSize,
      a: 4 * (-0.5 + Math.random()),
      b: 4 * (-0.5 + Math.random()),
      c: 4 * (-0.5 + Math.random()),
      d: 4 * (-0.5 + Math.random()),
    };
  }

  public update(factor: number) {
    this._time += this._dt * factor;
  }

  public get(): [number, number] {
    const p = this._parameter;
    const t = this._time;
    return [p.amp * Math.sin(p.a * t + p.c), p.amp * Math.sin(p.b * t + p.d)];
  }
}
