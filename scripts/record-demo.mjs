// Records a real browser session on the local machine. Captions are added only
// to the recording session; application source is unchanged. No external service.
import { createRequire } from "node:module";
import { mkdir, rename, writeFile } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
await mkdir("artifacts/recording", { recursive: true });
await mkdir("demo", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  bypassCSP: true,
  recordVideo: {
    dir: "artifacts/recording",
    size: { width: 1440, height: 960 },
  },
  acceptDownloads: true,
});
const page = await context.newPage();
const video = page.video();
const chapters = [];
const began = Date.now();
async function caption(title, body, seconds) {
  chapters.push({
    startSeconds: Number(((Date.now() - began) / 1000).toFixed(2)),
    title,
    text: body,
    intendedHoldSeconds: seconds,
  });
  await page.evaluate(
    ({ title, body }) => {
      let box = document.getElementById("recording-caption");
      if (!box) {
        box = document.createElement("aside");
        box.id = "recording-caption";
        Object.assign(box.style, {
          position: "fixed",
          left: "0",
          right: "0",
          bottom: "0",
          zIndex: "99999",
          background: "#153e38",
          color: "#fffefa",
          padding: "15px 38px 18px",
          boxShadow: "0 -3px 20px #0002",
          fontFamily: "-apple-system, sans-serif",
          pointerEvents: "none",
        });
        document.body.append(box);
      }
      box.replaceChildren();
      const heading = document.createElement("div");
      heading.textContent = title.toUpperCase();
      Object.assign(heading.style, {
        color: "#b9d5be",
        letterSpacing: "2px",
        fontSize: "11px",
        marginBottom: "6px",
      });
      const text = document.createElement("div");
      text.textContent = body;
      Object.assign(text.style, {
        fontSize: "20px",
        lineHeight: "1.45",
        maxWidth: "1320px",
      });
      box.append(heading, text);
    },
    { title, body },
  );
  await page.waitForTimeout(seconds * 1000);
}
try {
  await page.goto("http://127.0.0.1:4173");
  await caption(
    "What Changed? · A local procedure review desk",
    "When a reference document changes, which checklist steps deserve another look? This app connects the edits to the procedure you maintain.",
    8,
  );
  await page.locator("#demo").click();
  await page.locator("#inputs").scrollIntoViewIfNeeded();
  await caption(
    "1 · Bring the documents and your checklist",
    "This shipping policy is synthetic. Each [section heading] connects a checklist step to a source section. Unanchored steps use shared-word matching.",
    10,
  );
  await page.locator("#save").click();
  await caption(
    "A procedure you can reuse",
    "Save the checklist in this browser for the next revision. Documents and review decisions stay in the tab. No API, account or model download is needed.",
    8,
  );
  await page.locator("#compare").click();
  await page
    .locator("#workspace")
    .evaluate((e) => e.scrollIntoView({ block: "start" }));
  await caption(
    "2 · A deadline worth reviewing",
    "The dispatch cutoff moved from 3 p.m. to 1 p.m. Exact passages and line numbers sit side by side. The highlighted text changed; you decide whether the step should.",
    12,
  );
  await page.locator(".step-button").nth(1).click();
  await caption(
    "Keep unchanged evidence in view",
    "The returns passage still says 5 business days. “Text unchanged” describes this passage only. It does not certify that the checklist instruction is correct.",
    9,
  );
  await page.locator(".step-button").nth(2).click();
  await caption(
    "Missing evidence stays uncertain",
    "The archive passage is missing from the new version. The app does not invent a replacement rule or conclude that retention is no longer required.",
    10,
  );
  await page.locator(".step-button").nth(3).click();
  await caption(
    "Misleading wording needs a human",
    "The 24-to-12-hour edit is explicitly an example, not a commitment. The app flags uncertainty instead of telling staff to promise a faster replacement.",
    11,
  );
  await page.locator(".step-button").nth(0).click();
  await page.locator("#decision").selectOption("revise");
  await page
    .locator("#review-note")
    .fill(
      "Move label preparation earlier. Confirm the cutoff with the dispatch lead.",
    );
  await page.locator(".decision-panel").scrollIntoViewIfNeeded();
  await caption(
    "3 · Record a decision with the evidence",
    "A person marks “Revise step” and records what to check. Export includes both documents, exact passages, uncertainty reasons and human review notes.",
    10,
  );
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#export").click();
  const download = await downloadPromise;
  await download.saveAs("demo/example-review.json");
  await page.locator("#diff-panel summary").click();
  await page
    .locator("#diff-panel")
    .evaluate((e) => e.scrollIntoView({ block: "start" }));
  await caption(
    "A useful companion to a text diff",
    "The raw diff also shows title and brand-copy edits unrelated to these steps. The procedure view organizes a review; it does not replace reading the full source.",
    10,
  );
  await page
    .locator(".method")
    .evaluate((e) => e.scrollIntoView({ block: "center" }));
  await page.locator(".method details").evaluate((e) => (e.open = true));
  await caption(
    "The limits are part of the product",
    "This uses anchors and lexical matching, not semantic AI. Cross-references and subtle hypothetical wording can be missed. A 12-case diagnostic set matched 10 expectations, with 2 misses disclosed.",
    12,
  );
  await page
    .locator("#workspace")
    .evaluate((e) => e.scrollIntoView({ block: "start" }));
  await caption(
    "Evidence before assumptions",
    "What Changed? helps procedure owners see what to inspect, keep uncertainty visible and leave with a review they can explain. Built locally with the Devpost Learn Skill Pack.",
    8,
  );
  await context.close();
  const videoPath = await video.path();
  await rename(videoPath, "demo/what-changed-demo.webm");
  await writeFile(
    "demo/chapters.json",
    JSON.stringify(chapters, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      video: "demo/what-changed-demo.webm",
      elapsedSeconds: (Date.now() - began) / 1000,
      chapters: chapters.length,
    }),
  );
} finally {
  await browser.close();
}
