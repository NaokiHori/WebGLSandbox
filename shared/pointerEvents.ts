export class PointerEvents {
  private element: HTMLElement;
  private action: (event: MouseEvent) => void;
  private interval: number;
  private intervalId: number | null;

  public constructor(
    element: HTMLElement,
    action: (event: MouseEvent) => void,
  ) {
    this.element = element;
    this.action = action;
    this.interval = 25;
    this.intervalId = null;
    this.bindEvents();
  }

  private bindEvents() {
    this.element.addEventListener("pointerdown", this.startAction.bind(this));
    this.element.addEventListener("pointerup", this.stopAction.bind(this));
    this.element.addEventListener("pointerleave", this.stopAction.bind(this));
  }

  private startAction(event: MouseEvent) {
    if (this.intervalId === null) {
      // Prevent multiple intervals
      this.action(event); // Trigger immediately on pointerdown
      this.intervalId = setInterval(() => {
        this.action(event);
      }, this.interval);
    }
  }

  stopAction() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
