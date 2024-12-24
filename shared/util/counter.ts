export class Counter {
  _counter: number;

  constructor() {
    this._counter = 0;
  }

  public reset() {
    this._counter = 0;
  }

  public update() {
    this._counter += 1;
  }

  public get(): number {
    return this._counter;
  }
}
