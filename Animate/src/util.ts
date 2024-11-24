export class Angle {
  _arg: number;
  _increment: number;

  constructor(increment: number) {
    this._arg = 0;
    this._increment = increment;
  }

  public get(): number {
    return this._arg;
  }

  public update() {
    const twoPi = 2 * Math.PI;
    this._arg += this._increment;
    if (twoPi < this._arg) {
      this._arg -= twoPi;
    }
  }
}
