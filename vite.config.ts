import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vite builds the app; the `test` block configures Vitest (unit tests only).
export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
