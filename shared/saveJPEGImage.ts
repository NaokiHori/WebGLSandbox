export function saveJPEGImage(canvas: HTMLCanvasElement, fileName: string) {
  canvas.toBlob((blob: Blob | null) => {
    if (null === blob) {
      console.warn("Failed to create Blob from canvas");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/jpeg");
}
