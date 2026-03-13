import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@scripts": resolve(__dirname, "src/scripts"),
      "@features": resolve(__dirname, "src/scripts/features"),
      "@utils": resolve(__dirname, "src/scripts/utils"),
    },
  },
});