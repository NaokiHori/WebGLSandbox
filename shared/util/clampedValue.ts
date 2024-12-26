export class ClampedValue {
  private _isPeriodic: boolean;
  private _minValue: number;
  private _maxValue: number;
  private _value: number;

  public constructor({
    isPeriodic,
    minValue,
    maxValue,
    defaultValue,
  }: {
    isPeriodic: boolean;
    minValue: number;
    maxValue: number;
    defaultValue: number;
  }) {
    this._isPeriodic = isPeriodic;
    this._value = defaultValue;
    this._minValue = minValue;
    this._maxValue = maxValue;
    this.clampValue();
  }

  public update(newValue: number) {
    this._value = newValue;
    this.clampValue();
  }

  public get(): number {
    return this._value;
  }

  private clampValue() {
    if (this._isPeriodic) {
      if (this._value < this._minValue) {
        this._value += this._maxValue - this._minValue;
      } else if (this._maxValue < this._value) {
        this._value -= this._maxValue - this._minValue;
      }
    } else {
      this._value = Math.min(this._maxValue, this._value);
      this._value = Math.max(this._minValue, this._value);
    }
  }
}
