// Screenshots do tema (dark padrão + uma light). uso: node scripts/shot-dark.mjs
import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = process.env.SHOT_DIR ?? ".";
const BASE = "http://localhost:5173";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const session = {
  user: { name: "Arthur Renzo", email: "arthur@empresa.com", initials: "AR", via: "email" },
  repo: { owner: "acme", repo: "checkout-web" },
};

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: "new",
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1150, deviceScaleFactor: 1 });

// login em dark (padrão)
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await wait(500);
await page.screenshot({ path: `${OUT}/d-login.png` });

await page.evaluate((s) => localStorage.setItem("qa-copilot:auth", JSON.stringify(s)), session);

// dashboard dark
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2" });
await wait(500);
await page.screenshot({ path: `${OUT}/d-dashboard.png` });

// copilot dark + análise
await page.goto(`${BASE}/argus`, { waitUntil: "networkidle2" });
await wait(500);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes("Analisar o PR"));
  b?.click();
});
await wait(9000);
await page.screenshot({ path: `${OUT}/d-copilot.png` });

// prova do toggle: light no dashboard
await page.evaluate(() => localStorage.setItem("qa-copilot:theme", "light"));
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2" });
await wait(500);
await page.screenshot({ path: `${OUT}/d-dashboard-light.png` });

await browser.close();
console.log("ok");
