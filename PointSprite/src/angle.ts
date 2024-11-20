const twoPi = 2 * Math.PI;

export class Angle {
  _value: number;
  _increment: number;

  constructor(increment: number) {
    this._value = 0;
    this._increment = increment;
  }

  public getCurrentValue(): number {
    return this._value;
  }

  public update() {
    this._value += this._increment;
    if (twoPi < this._value) {
      this._value -= twoPi;
    } else if (this._value < -twoPi) {
      this._value += twoPi;
    }
  }
}
