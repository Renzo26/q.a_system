// Screenshots mobile (390px) do QA Copilot. uso: node scripts/shot-mobile.mjs
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
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

// login (público) — mobile mostra só o formulário
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await wait(500);
await page.screenshot({ path: `${OUT}/m-login.png` });

// semeia sessão
await page.evaluate((s) => localStorage.setItem("qa-copilot:auth", JSON.stringify(s)), session);

// copilot empty
await page.goto(`${BASE}/argus`, { waitUntil: "networkidle2" });
await wait(600);
await page.screenshot({ path: `${OUT}/m-copilot-empty.png` });

// abre o drawer (menu)
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === "Abrir menu");
  b?.click();
});
await wait(500);
await page.screenshot({ path: `${OUT}/m-drawer.png` });
// fecha o drawer clicando no backdrop
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === "Fechar menu");
  b?.click();
});
await wait(400);

// dispara análise
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes("Analisar o PR"));
  b?.click();
});
await wait(9000);
await page.screenshot({ path: `${OUT}/m-copilot-analysis.png` });

// dashboard
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle2" });
await wait(600);
await page.screenshot({ path: `${OUT}/m-dashboard.png` });

await browser.close();
console.log("ok");
