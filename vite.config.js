import { resolve } from "path";
import { defineConfig } from "vite";

const root = resolve(__dirname, ".");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  root,
  build: {
    outDir,
    rollupOptions: {
      input: {
        main: resolve(root, ".", "index.html"),
        helloWorld: resolve(root, "HelloWorld", "index.html"),
        fullScreen: resolve(root, "FullScreen", "index.html"),
        mandelbrot: resolve(root, "Mandelbrot", "index.html"),
        animate: resolve(root, "Animate", "index.html"),
      },
    },
  },
  plugins: [
    {
      name: "html-transform",
      transformIndexHtml: (html) =>
        html.replace(/__VITE_TITLE__/g, "WebGL Sandbox"),
    },
  ],
});
