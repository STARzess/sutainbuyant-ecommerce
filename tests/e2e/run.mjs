import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const cli = require.resolve("@playwright/test/cli");
const args = process.argv.slice(2);
for (const config of args.length ? ["playwright.config.ts"] : ["playwright.config.ts", "playwright.empty.config.ts"]) {
  const child = spawn(process.execPath, [cli, "test", "--config", config, ...args], { stdio: "inherit", windowsHide: true });
  const [code] = await once(child, "exit"); if (code !== 0) process.exit(code || 1);
}
