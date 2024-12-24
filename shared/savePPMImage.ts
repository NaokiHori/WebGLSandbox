interface SavePPMImageArgs {
  fileName: string;
  width: number;
  height: number;
  pixelData: Uint8Array;
}

export function savePPMImage({
  fileName,
  width,
  height,
  pixelData,
}: SavePPMImageArgs) {
  const suffix = ".ppm";
  if (!fileName.endsWith(suffix)) {
    console.warn(`File name (${fileName}) should end with ${suffix}`);
    return;
  }
  const maxColorValue = 255;
  const header = `P6\n${width.toString()} ${height.toString()}\n${maxColorValue.toString()}\n`;
  const blob = new Blob([header, new Uint8Array(pixelData)], {
    type: "application/octet-stream",
  });
  const link: HTMLAnchorElement = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}
