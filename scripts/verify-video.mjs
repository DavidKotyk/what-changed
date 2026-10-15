import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stat, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = createRequire(import.meta.url)(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const browser = await chromium.launch({
  headless: true,
  channel: process.env.BROWSER_CHANNEL || "chrome",
});
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(resolve("demo/preview.html")).href);
  await page.locator("video").evaluate(async (v) => {
    if (v.readyState < 1)
      await new Promise((ok, fail) => {
        v.addEventListener("loadedmetadata", ok, { once: true });
        v.addEventListener(
          "error",
          () => fail(new Error("Video metadata failed")),
          { once: true },
        );
      });
  });
  const info = await page
    .locator("video")
    .evaluate((v) => ({
      durationSeconds: v.duration,
      width: v.videoWidth,
      height: v.videoHeight,
      error: v.error?.message || null,
    }));
  assert.ok(info.durationSeconds > 60 && info.durationSeconds < 180);
  assert.equal(info.width, 1440);
  assert.equal(info.height, 960);
  assert.equal(info.error, null);
  await page.locator("video").evaluate(async (v) => {
    v.muted = true;
    v.playbackRate = 4;
    await v.play();
  });
  await page.waitForFunction(
    () =>
      document.querySelector("video").ended ||
      document.querySelector("video").error,
    null,
    { timeout: 60000 },
  );
  const playback = await page
    .locator("video")
    .evaluate((v) => ({
      ended: v.ended,
      currentTime: v.currentTime,
      error: v.error?.message || null,
    }));
  assert.equal(playback.ended, true);
  assert.equal(playback.error, null);
  const result = {
    ...info,
    bytes: (await stat("demo/what-changed-demo.webm")).size,
    fullPlaybackVerifiedAt4x: true,
    playback,
    browser: await browser.version(),
    visualSamplesSeconds: [38, 67, 90],
    note: "Extracted frames at these times were visually inspected separately. No audio track; captions are burned into the recording.",
  };
  await writeFile(
    "docs/video-check.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
