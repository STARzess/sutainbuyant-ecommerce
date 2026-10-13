import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const require = createRequire(import.meta.url);
const lighthouseRequire = createRequire(require.resolve("lighthouse/package.json"));
const { launch } = await import(pathToFileURL(lighthouseRequire.resolve("chrome-launcher")).href);
const base = new URL(process.env.AUDIT_BASE_URL || "http://127.0.0.1:3100");
if (!["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)) throw new Error("This audit runs against the local preview only");
const response = await fetch(new URL("/products", base));
if (!response.ok) throw new Error("Start the production preview before running the audit");
const id = (await response.text()).match(/href="\/products\/([1-9]\d*)/)?.[1];
if (!id) throw new Error("The product list has no detail page to audit");
const folder = path.resolve("lighthouse-report"); fs.mkdirSync(folder, { recursive: true });
// The launcher creates and removes a fresh temporary profile for each run.
const browser = await launch({ chromePath: process.env.LIGHTHOUSE_CHROME_PATH || chromium.executablePath(), chromeFlags: ["--headless=new", "--disable-background-networking", "--no-first-run"], handleSIGINT: false });
const summary = [];
try {
  for (const [name, route] of [["home", "/"], ["products", "/products"], ["detail", `/products/${id}`]]) {
    const result = await lighthouse(new URL(route, base).href, { port: browser.port, output: ["html", "json"], logLevel: "error", onlyCategories: ["performance", "seo", "accessibility", "best-practices"] });
    fs.writeFileSync(path.join(folder, `${name}.html`), result.report[0]); fs.writeFileSync(path.join(folder, `${name}.json`), result.report[1]);
    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, category]) => [key, Math.round((category.score ?? 0) * 100)]));
    const item = { route, scores, lighthouseVersion: result.lhr.lighthouseVersion, formFactor: result.lhr.configSettings.formFactor, warnings: result.lhr.runWarnings };
    summary.push(item); console.log(JSON.stringify(item));
  }
  if (summary.some(item => item.scores.performance < 90 || item.scores.seo < 90)) process.exitCode = 1;
} finally { await browser.kill(); fs.writeFileSync(path.join(folder, "summary.json"), JSON.stringify(summary, null, 2)); }
