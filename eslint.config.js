import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.config.js",
      "**/*.config.ts",
      "e2e/**",
      "**/scripts/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./packages/core/tsconfig.json", "./apps/desktop/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
);
