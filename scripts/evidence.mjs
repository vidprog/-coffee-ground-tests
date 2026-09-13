#!/usr/bin/env node
/**
 * Генератор скріншотів-доказів.
 *
 *   node scripts/evidence.mjs <мітка> [--test <id тесту>] [--mobile]
 *
 * Кладе PNG у docs/evidence/ з іменем виду <мітка>-<екран>.png.
 * Мітка зазвичай: before-12 / after-12, де 12 — номер тікета.
 */
import { chromium, devices } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const label = args[0];
if (!label) {
  console.error("Вкажи мітку: node scripts/evidence.mjs before-12 [--test flower] [--mobile]");
  process.exit(1);
}
const testId = args.includes("--test") ? args[args.indexOf("--test") + 1] : null;
const mobile = args.includes("--mobile");

const OUT = path.resolve("docs/evidence");
const PORT = 8123;
const BASE = `http://127.0.0.1:${PORT}`;

await mkdir(OUT, { recursive: true });

const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
  stdio: "ignore"
});
process.on("exit", () => server.kill());

const browser = await chromium.launch();
const context = await browser.newContext(
  mobile ? { ...devices["iPhone 13"] } : { viewport: { width: 1280, height: 900 } }
);
const page = await context.newPage();

const shot = async (name) => {
  const file = path.join(OUT, `${label}-${name}${mobile ? "-mobile" : ""}.png`);
  await page.waitForTimeout(600); // даємо анімаціям осісти
  await page.screenshot({ path: file, fullPage: true });
  console.log("✓", path.relative(process.cwd(), file));
};

await waitForServer();
await page.goto(BASE);
await shot("home");

const card = testId
  ? page.locator(".test-card", { hasText: idToTitle(testId) })
  : page.locator(".test-card").first();
await card.click();
await shot("question");

// між питаннями app.js блокує кліки на ~320мс — чекаємо зміни лічильника
for (let i = 0; i < 5; i++) {
  await page.waitForFunction(
    (n) => document.querySelector("#q-index")?.textContent.includes(`Питання ${n} з`),
    i + 1
  );
  await page.locator(".option").first().click();
}
await page.waitForSelector("#screen-result.is-active");
await shot("result");

await browser.close();
server.kill();

function idToTitle(id) {
  return { flower: "квітка", hero: "герой", fridge: "холодильника", past: "минулому" }[id] ?? id;
}

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(BASE);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Сервер не піднявся");
}
