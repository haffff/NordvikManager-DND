// Goes through every JSON data file under a folder, writes the SRD-only copies and a
// report of what is SRD.
//
//   node scripts/srd/extract-srd.mjs [inputDir] [outputDir]
//
// Defaults: tmp-data-to-process/ (gitignored, holds the full source data) and
// tmp-data-to-process/_srd/ (skipped as input). Nothing here is shipped: review the
// output, then copy what the addon should use into data/.
import fs from "node:fs";
import path from "node:path";
import { extractSrd } from "./srdFilter.mjs";

const inputDir = path.resolve(process.argv[2] ?? "tmp-data-to-process");
const outputDir = path.resolve(process.argv[3] ?? path.join(inputDir, "_srd"));

const jsonFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) return full === outputDir ? [] : jsonFiles(full);
    return d.name.endsWith(".json") ? [full] : [];
  });

const rows = [];
let unreadable = 0;
for (const file of jsonFiles(inputDir)) {
  const rel = path.relative(inputDir, file);
  let sections;
  try {
    sections = extractSrd(JSON.parse(fs.readFileSync(file, "utf8")));
  } catch (e) {
    console.warn(`skipped ${rel}: ${e.message}`);
    unreadable++;
    continue;
  }

  const kept = {};
  for (const [section, s] of Object.entries(sections)) {
    rows.push({ file: rel, section, ...s });
    if (s.entries.length) kept[section] = s.entries;
  }
  if (Object.keys(kept).length) {
    const out = path.join(outputDir, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(kept, null, 2));
  }
}

rows.sort((a, b) => b.entries.length - a.entries.length || a.file.localeCompare(b.file));
const withSrd = rows.filter((r) => r.entries.length);
const sum = (key, list) => list.reduce((n, r) => n + r[key], 0);

const report = [
  "# SRD content in the source data",
  "",
  `Input: ${inputDir}`,
  `${withSrd.length} of ${rows.length} sections contain SRD entries: ` +
    `${sum("srd51", rows)} SRD 5.1, ${sum("srd52", rows)} SRD 5.2 flags, ${sum("total", rows)} entries in total.`,
  "Entries with `_copy` are built from another entry; check that entry is SRD too.",
  "",
  "| File | Section | Total | SRD 5.1 | SRD 5.2 | Kept | _copy |",
  "|---|---|---:|---:|---:|---:|---:|",
  ...withSrd.map((r) => `| ${r.file} | ${r.section} | ${r.total} | ${r.srd51} | ${r.srd52} | ${r.entries.length} | ${r.copies || ""} |`),
  "",
  "## Sections without SRD content",
  "",
  ...rows.filter((r) => !r.entries.length).map((r) => `- ${r.file}: ${r.section} (${r.total})`),
  "",
].join("\n");

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "REPORT.md"), report);
console.log(report.split("\n## Sections without")[0]);
console.log(`Wrote SRD-only copies and REPORT.md to ${outputDir}${unreadable ? ` (${unreadable} files skipped)` : ""}`);
