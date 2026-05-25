import { defineConfig } from "@playwright/test";

const PORT = 4173;
const HOST = "127.0.0.1";
const BASE_URL = `http://${HOST}:${PORT}`;

export default defineConfig({
  testDir: "./smoke",
  testMatch: /.*\.spec\.ts/,
  testIgnore: ["**/src/**/*.test.ts"],
  use: {
    browserName: "chromium",
    baseURL: BASE_URL,
  },
  webServer: {
    command: `npx vite --host ${HOST} --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
