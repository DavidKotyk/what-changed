# Working-app demonstration

- File: [what-changed-demo.webm](what-changed-demo.webm)
- Local player: open [preview.html](preview.html) directly in a browser.
- Encoded duration: **1 minute 58.08 seconds**, under three minutes.
- Format: WebM / VP8, 1440 × 960, 25 fps, captions embedded in video; no audio or music.
- Recorded on the local Mac from the actual running app using Playwright and Chrome. The automation clicks the app, records decisions, downloads the review and opens the raw diff. Captions explain the actions. The page content is real application rendering, not composited mockups.
- All Harbor Desk materials and the reviewer note are synthetic demonstration content. No actual customer data or policy is used.
- The recording isolates the browser viewport: no browser chrome, unrelated windows, account details, third-party branding or music.

Full media playback and duration/dimensions are checked by scripts/verify-video.mjs; results are in docs/video-check.json. Frames at 38, 67 and 90 seconds were extracted and visually inspected for readable captions and genuine application state. Their PNG files are local ignored artifacts. Browser checks and real-use validation remain distinct.

## Sequence
1. Explain the procedure-maintenance problem.
2. Load the labeled synthetic documents and checklist; explain section anchors.
3. Save the procedure locally.
4. Compare and inspect the 3 p.m. → 1 p.m. dispatch cutoff.
5. Inspect unchanged returns evidence.
6. Inspect the missing archive passage; avoid inferring a repeal.
7. Inspect changed example language; avoid inventing a commitment.
8. Record a human review decision and note; export the evidence.
9. Compare with the raw diff and explain limitations.
10. Close with the product purpose and Skill Pack provenance.

`chapters.json` captures action timestamps from the recording script. Encoder capture timing can differ slightly; the media duration is authoritative. `example-review.json` is the actual synthetic download made during recording.

## Re-record

Start `npm start` in another terminal. With a separate Playwright installation and installed Chrome:

```sh
node scripts/record-demo.mjs
node scripts/verify-video.mjs
```

See README.md for optional Playwright setup and PLAYWRIGHT_MODULE. Recording overwrites this project's demo video only. No external video-generation service is used.

## Publication

User approval was received. Published video: https://youtu.be/vTV7kH7ZSBE . YouTube Studio confirmed publication and Public visibility; signed-out Incognito playback was verified. The Devpost entry itself has not been submitted.
