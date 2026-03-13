import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["packages/core/src/**/*.test.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@ai-limits/core": path.resolve(__dirname, "packages/core/src"),
    },
  },
});
