import { defineConfig } from "@playwright/test";

// Config for recording the demo video only (run with `npm run demo:record`).
export default defineConfig({
  testDir: ".",
  testMatch: "record-demo.spec.ts",
  timeout: 120_000,
  reporter: "list",
  use: { trace: "off" },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
