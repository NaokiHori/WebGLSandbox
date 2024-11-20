export function getCanvasElement(canvasId: string): HTMLCanvasElement {
  const canvas: HTMLElement | null = document.getElementById(canvasId);
  if (null === canvas) {
    throw new Error(`canvas element (id: ${canvasId}) is not found`);
  }
  return canvas as HTMLCanvasElement;
}

export function syncCanvasSize(canvas: HTMLCanvasElement) {
  const rect: DOMRect = canvas.getBoundingClientRect();
  const width: number = rect.width;
  const height: number = rect.height;
  canvas.width = width;
  canvas.height = height;
}
