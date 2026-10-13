import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e", testMatch: "**/storefront.spec.ts", fullyParallel: false, workers: 1,
  timeout: 45000, retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/flows" }]],
  use: { baseURL: "http://127.0.0.1:3105", headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || undefined, viewport: { width: 1440, height: 1000 }, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "node tests/e2e/server.mjs", url: "http://127.0.0.1:3105/api/auth/session", reuseExistingServer: false, timeout: 180000, stdout: "pipe", stderr: "pipe" },
});
