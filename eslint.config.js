// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "no-shadow": [
        "error",
        {
          builtinGlobals: false,
          hoist: "functions",
          allow: [],
          ignoreOnInitialization: false,
        },
      ],
    },
  },
  {
    ignores: ["node_modules/", "dist/", "eslint.config.js", "vite.config.js"],
  },
);
