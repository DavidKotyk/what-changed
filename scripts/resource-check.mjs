import { performance } from "node:perf_hooks";
import { writeFile } from "node:fs/promises";
import { compare, lineDiff } from "../src/engine.js";
const before = "Parcel dispatch needs labels.\n".repeat(2800).slice(0, 80000);
const after = "Parcel dispatch needs new labels.\n"
  .repeat(2500)
  .slice(0, 80000);
const procedure = Array(100).fill("Parcel dispatch needs labels.").join("\n");
const start = performance.now();
const result = compare(before, after, procedure);
const compareMs = performance.now() - start;
const diffStart = performance.now();
const diff = lineDiff(
  Array.from({ length: 1500 }, (_, i) => "Old " + i).join("\n"),
  Array.from({ length: 1500 }, (_, i) => "New " + i).join("\n"),
);
const output = {
  runtime: process.version,
  platform: `${process.platform}/${process.arch}`,
  inputChars: [before.length, after.length],
  steps: result.results.length,
  compareMs: Number(compareMs.toFixed(2)),
  diff1500LinesMs: Number((performance.now() - diffStart).toFixed(2)),
  diffOutputLines: diff.lines.length,
  maxRssMiB: Number((process.resourceUsage().maxRSS / 1024).toFixed(2)),
  note: "Single synthetic run, Node process peak RSS; not browser peak memory or a general worst-case benchmark.",
};
await writeFile(
  "docs/resource-check.json",
  JSON.stringify(output, null, 2) + "\n",
);
console.log(JSON.stringify(output, null, 2));
