import { test } from "node:test";
import assert from "node:assert/strict";
import { srdEditions, toSrdEntry, extractSrd } from "./srdFilter.mjs";

test("an entry is SRD 5.1 with srd, SRD 5.2 with srd52, or both", () => {
  assert.deepEqual(srdEditions({ srd: true }), ["5.1"]);
  assert.deepEqual(srdEditions({ srd52: true }), ["5.2"]);
  assert.deepEqual(srdEditions({ srd: true, srd52: true }), ["5.1", "5.2"]);
  // A string is the SRD's own name for the entry: still SRD.
  assert.deepEqual(srdEditions({ srd: "Potion of Healing" }), ["5.1"]);
});

test("Basic Rules or no flag is not SRD (free to read, not openly licensed)", () => {
  assert.deepEqual(srdEditions({}), []);
  assert.deepEqual(srdEditions({ basicRules: true, basicRules2024: true }), []);
  assert.deepEqual(srdEditions({ srd: false }), []);
});

test("an SRD entry loses its book references and is tagged with its SRD edition", () => {
  const entry = toSrdEntry({
    name: "Alert", source: "XPHB", page: 200, srd52: true, basicRules2024: true,
    reprintedAs: ["Alert|XPHB"], referenceSources: ["XPHB"], additionalSources: [{ source: "X" }],
    otherSources: [{ source: "Y" }], hasFluff: true, hasFluffImages: true, fluff: {}, lootTables: ["A"],
    entries: ["You gain the following benefits."],
  });

  assert.deepEqual(entry, { name: "Alert", source: "XPHB", srdEditions: ["5.2"], entries: ["You gain the following benefits."] });
});

test("an SRD entry takes the SRD's name when it has its own", () => {
  assert.equal(toSrdEntry({ name: "Book Name", source: "PHB", srd: "SRD Name" }).name, "SRD Name");
  assert.equal(toSrdEntry({ name: "Book Name", source: "XPHB", srd: "Old SRD", srd52: "New SRD" }).name, "New SRD");
});

test("a file is reduced to its SRD entries, section by section, with counts", () => {
  const result = extractSrd({
    _meta: { internalCopies: ["feat"] },
    feat: [
      { name: "Grappler", source: "PHB", srd: true },
      { name: "Alert", source: "XPHB", srd52: true },
      { name: "Lucky", source: "PHB" },
    ],
    featFluff: [{ name: "Lucky", source: "PHB", images: [] }],
    notEntries: ["a", "b"],
  });

  assert.deepEqual(Object.keys(result), ["feat", "featFluff"]);
  assert.deepEqual(
    { total: result.feat.total, srd51: result.feat.srd51, srd52: result.feat.srd52 },
    { total: 3, srd51: 1, srd52: 1 },
  );
  assert.deepEqual(result.feat.entries.map((e) => e.name), ["Grappler", "Alert"]);
  assert.equal(result.featFluff.entries.length, 0);
});

test("entries copied from another (_copy) are counted, so they can be reviewed", () => {
  const result = extractSrd({ item: [{ name: "Copy", source: "PHB", srd: true, _copy: { name: "Base", source: "PHB" } }] });

  assert.equal(result.item.copies, 1);
});
