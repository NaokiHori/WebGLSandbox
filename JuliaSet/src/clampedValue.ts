export class ClampedValue {
  private _value: number;
  private _minValue: number;
  private _maxValue: number;

  public constructor({
    minValue,
    maxValue,
    defaultValue,
  }: {
    minValue: number;
    maxValue: number;
    defaultValue: number;
  }) {
    this._minValue = minValue;
    this._maxValue = maxValue;
    this._value = defaultValue;
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
    this._value = Math.min(this._maxValue, this._value);
    this._value = Math.max(this._minValue, this._value);
  }
}
