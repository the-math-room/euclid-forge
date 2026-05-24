import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./smoke",
  testMatch: /.*\.spec\.ts/,
  testIgnore: ["**/src/**/*.test.ts"],
  use: {
    browserName: "chromium",
    baseURL: "http://127.0.0.1:5173",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
  },
});