export class Toggle {
  private _isEnabled: boolean;
  private _onEnabled: () => void;
  private _onDisabled: () => void;

  public constructor({
    defaultState,
    onEnabled,
    onDisabled,
  }: {
    defaultState: boolean;
    onEnabled: () => void;
    onDisabled: () => void;
  }) {
    this._isEnabled = defaultState;
    this._onEnabled = onEnabled;
    this._onDisabled = onDisabled;
  }

  public update(newState?: boolean) {
    if (undefined === newState) {
      this._isEnabled = !this._isEnabled;
    } else {
      this._isEnabled = newState;
    }
    if (this._isEnabled) {
      this._onEnabled();
    } else {
      this._onDisabled();
    }
  }

  public getCurrentState(): boolean {
    return this._isEnabled;
  }
}
