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
        fullScreen: resolve(root, "FullScreen", "index.html"),
        pointSprite: resolve(root, "PointSprite", "index.html"),
        texture: resolve(root, "Texture", "index.html"),
        juliaSet: resolve(root, "JuliaSet", "index.html"),
        scalar2D: resolve(root, "Scalar2D", "index.html"),
        threeDimensional: resolve(root, "ThreeDimensional", "index.html"),
        repeatedTransformFeedback: resolve(
          root,
          "RepeatedTransformFeedback",
          "index.html",
        ),
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
