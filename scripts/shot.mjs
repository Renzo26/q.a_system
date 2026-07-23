// Screenshot autenticado do QA Copilot usando o Edge já instalado.
// uso: node scripts/shot.mjs
import puppeteer from "puppeteer-core";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = process.env.SHOT_DIR ?? ".";
const BASE = "http://localhost:5173";

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
await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 1 });

// estabelece a origem e semeia a sessão
await page.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
await page.evaluate((s) => localStorage.setItem("qa-copilot:auth", JSON.stringify(s)), session);

// empty state do Copilot
await page.goto(`${BASE}/argus`, { waitUntil: "networkidle2" });
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: `${OUT}/copilot-empty.png` });

// dispara uma análise clicando no starter
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent?.includes("Analisar o PR"));
  b?.click();
});
await new Promise((r) => setTimeout(r, 9000)); // aguarda o streaming simulado terminar
await page.screenshot({ path: `${OUT}/copilot-analysis.png` });

await browser.close();
console.log("ok");
