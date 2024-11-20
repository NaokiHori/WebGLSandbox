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

export class Counter {
  _cntr: number;

  constructor() {
    this._cntr = 0;
  }

  public get(): number {
    return this._cntr;
  }

  public update() {
    this._cntr += 1;
  }

  public reset() {
    this._cntr = 0;
  }
}

export class Timer {
  _increment: number;
  _start_at: number;

  constructor(increment: number) {
    this._increment = increment;
    this._start_at = 0;
  }

  public get increment(): number {
    return this._increment;
  }

  public start() {
    this._start_at = performance.now();
  }

  public elapsed(): boolean {
    return this._increment < performance.now() - this._start_at;
  }
}
