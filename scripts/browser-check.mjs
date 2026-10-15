// Optional browser QA. Install Playwright locally, or point PLAYWRIGHT_MODULE at
// an existing installation. The app itself has no package dependencies.
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const baseUrl = process.env.APP_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [],
  external = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (req) => {
  if (!req.url().startsWith(baseUrl + "/")) external.push(req.url());
});
await mkdir("artifacts", { recursive: true });
try {
  await page.goto(baseUrl);
  await page.getByRole("button", { name: "Compare versions" }).click();
  assert.match(await page.locator("#notice").innerText(), /Add both/);
  checks.push("Empty inputs rejected");
  await page.locator("#demo").click();
  await page.getByRole("button", { name: "Compare versions" }).click();
  assert.equal(await page.locator(".step-button").count(), 4);
  assert.match(await page.locator("#detail").innerText(), /3 p.m./);
  assert.match(await page.locator("#detail").innerText(), /1 p.m./);
  assert.match(
    await page.locator("#counts").innerText(),
    /1\s+Review change\s+2\s+Uncertain\s+1\s+Text unchanged/,
  );
  checks.push("Demo categories and exact deadline evidence rendered");
  await page.screenshot({
    path: "artifacts/desktop-review.png",
    fullPage: true,
  });
  await page.locator("#decision").selectOption("revise");
  await page
    .locator("#review-note")
    .fill("Move label preparation earlier; confirm cutoff with dispatch lead.");
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export").click();
  const download = await downloadPromise;
  const path = await download.path();
  const data = JSON.parse(await readFile(path, "utf8"));
  assert.equal(data.results[0].review.decision, "revise");
  assert.match(data.results[0].review.note, /Move label/);
  assert.equal(data.results.length, 4);
  assert.equal(data.inputs.before.includes("3 p.m."), true);
  await writeFile(
    "artifacts/example-review.json",
    JSON.stringify(data, null, 2),
  );
  checks.push(
    "Export includes all evidence, inputs, limitations and human decisions",
  );
  await page.locator("#filter").selectOption("uncertain");
  assert.equal(await page.locator(".step-button").count(), 2);
  assert.match(
    await page.locator("#detail").innerText(),
    /No supporting passage/,
  );
  await page.locator(".step-button").nth(1).click();
  assert.match(
    await page.locator("#detail").innerText(),
    /nonbinding language/,
  );
  checks.push(
    "Uncertainty filter exposes missing evidence and misleading example",
  );
  await page.locator("#filter").selectOption("all");
  await page.locator("#diff-panel summary").click();
  assert.ok(await page.locator(".diff-line.add").count());
  assert.ok(await page.locator(".diff-line.remove").count());
  checks.push("Raw line diff shows additions and removals");
  await page.locator("#inputs summary").click();
  await page.locator("#save").click();
  await page.reload();
  assert.match(
    await page.locator("#procedure").inputValue(),
    /Dispatch window/,
  );
  assert.equal(await page.locator("#before").inputValue(), "");
  checks.push("Only explicitly saved procedure survives reload");
  await page.locator("#demo").click(); // saved procedure equals demo; no replacement dialog needed
  await page.locator("#compare").click();
  await page.locator("#inputs summary").click();
  await page
    .locator("#after")
    .fill("## Dispatch window\nSubmit labels by noon.");
  assert.equal(await page.locator("#review").isVisible(), false);
  assert.equal(await page.locator("#export").isDisabled(), true);
  checks.push("Editing inputs clears results and disables stale export");
  await page
    .locator("#before")
    .fill("## Test\n<script>window.unsafe=true</script>");
  await page
    .locator("#after")
    .fill("## Test\n<script>window.unsafe=true</script> changed");
  await page.locator("#procedure").fill("[Test] Read the literal source.");
  await page.locator("#compare").click();
  assert.match(
    await page.locator("#detail blockquote").first().innerText(),
    /<script>/,
  );
  assert.equal(await page.evaluate(() => window.unsafe), undefined);
  checks.push("Source HTML remains literal text");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "artifacts/mobile-review.png",
    fullPage: true,
  });
  checks.push("390px viewport has no page overflow");
  await page.goto(baseUrl + "/devpost/app-map.html");
  assert.match(await page.locator("h1").innerText(), /explainable review/);
  assert.equal(await page.locator("body").evaluate(e => getComputedStyle(e).backgroundColor), "rgb(247, 246, 241)");
  checks.push("App map served with offline content and styling");
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  checks.push("No browser exceptions or external requests");
  const output = {
    checkedAt: new Date().toISOString(),
    browser: await browser.version(),
    checks,
    errors,
    externalRequests: external,
  };
  await writeFile(
    "artifacts/browser-check.json",
    JSON.stringify(output, null, 2),
  );
  console.log(JSON.stringify(output, null, 2));
} finally {
  await browser.close();
}
