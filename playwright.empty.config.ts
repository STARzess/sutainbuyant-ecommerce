import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({ ...base, testMatch: "**/empty.spec.ts", use: { ...base.use, baseURL: "http://127.0.0.1:3106" }, reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/empty" }]],
  webServer: { command: "node tests/e2e/server.mjs", url: "http://127.0.0.1:3106/api/auth/session", reuseExistingServer: false, timeout: 180000, stdout: "pipe", stderr: "pipe", env: { QA_EMPTY_CATALOG: "1", QA_API_PORT: "4326", QA_APP_PORT: "3106" } },
});
