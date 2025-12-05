import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/mocks/setupTests.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      /*       lines: 90,
      functions: 90,
      branches: 90,
      statements: 90, */
      exclude: [
        "node_modules/",
        "**/__mocks__/",
        "**/main.jsx",
        "**vite.config.js",
      ],
    },
  },
});
