import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanText, cleanValue, buildEdition, LICENSES } from "./buildData.mjs";

const refs = {
  spell: new Set(["fireball"]),
  item: new Set(["longsword"]),
  feat: new Set(["alert"]),
  language: new Set(["elvish"]),
};

test("book and filter links become their text", () => {
  assert.equal(cleanText("See {@book chapter 7|XPHB|7}.", refs), "See chapter 7.");
  assert.equal(cleanText("from the {@filter Cleric|spells|class=Cleric} list", refs), "from the Cleric list");
});

test("links to entries we ship stay; links to anything else become plain text", () => {
  assert.equal(cleanText("cast {@spell Fireball|XPHB}", refs), "cast {@spell Fireball|XPHB}");
  assert.equal(cleanText("a {@item longsword|phb}", refs), "a {@item longsword|phb}");
  assert.equal(cleanText("cast {@spell Wish|XPHB}", refs), "cast Wish");
  assert.equal(cleanText("a {@creature goblin|XMM|Goblins}", refs), "a Goblins");
  assert.equal(cleanText("the {@race Elf|XPHB}", refs), "the Elf");
});

test("dice, damage, conditions and formatting stay for the cards to render", () => {
  const text = "{@damage 8d6} fire, {@dice 1d20}, {@condition Prone|XPHB}, {@b bold}, {@variantrule Hit Points|XPHB}";
  assert.equal(cleanText(text, refs), text);
});

test("values are cleaned deeply, book page refs and links to unshipped data removed", () => {
  const cleaned = cleanValue({
    name: "Chariot",
    entries: ["A {@book reference|DMG}.", { type: "entries", page: 12, entries: ["inner {@creature horse|MM}"] }],
    classFeatures: ["Rage|Barbarian||1"],
    optionalfeatures: ["x"],
    seeAlsoVehicle: ["Chariot"],
    hasRefs: true,
    fonts: ["fonts/x.ttf"],
    _versions: [{}],
  }, refs);

  assert.deepEqual(cleaned, { name: "Chariot", entries: ["A reference.", { type: "entries", entries: ["inner horse"] }] });
});

test("nested blocks from books outside the SRD are dropped", () => {
  const cleaned = cleanValue({
    additionalEntries: [
      { type: "inset", name: "Chariots", source: "MOT", entries: ["Not SRD"] },
      { type: "entries", source: "DMG", entries: ["kept"] },
      "plain",
    ],
  }, refs);

  assert.deepEqual(cleaned.additionalEntries, [{ type: "entries", source: "DMG", entries: ["kept"] }, "plain"]);
});

const srd = {
  items: [
    { name: "Bag of Holding", source: "DMG", srdEditions: ["5.1"] },
    { name: "Bag of Holding", source: "XDMG", srdEditions: ["5.2"], entries: ["See {@spell Fireball|XPHB}."] },
  ],
  baseItems: [{ name: "Longsword", source: "PHB", srdEditions: ["5.1", "5.2"] }],
  spells: [{ name: "Fireball", source: "XPHB", srdEditions: ["5.2"] }],
  feats: [{ name: "Grappler", source: "PHB", srdEditions: ["5.1"] }, { name: "Alert", source: "XPHB", srdEditions: ["5.2"] }],
  languages: [{ name: "Elvish", source: "XPHB", srdEditions: ["5.2"] }],
};

test("an edition gets only its own entries, items and base items together, in the wrappers the cards read", () => {
  const files = buildEdition("5.2", srd);

  assert.deepEqual(Object.keys(files).sort(), ["feats.json", "items.json", "languages.json", "spells.json"]);
  assert.deepEqual(files["items.json"].item.map((i) => `${i.name}|${i.source}`), ["Bag of Holding|XDMG", "Longsword|PHB"]);
  assert.deepEqual(files["spells.json"].spell.map((s) => s.name), ["Fireball"]);
  assert.deepEqual(files["feats.json"].feat.map((f) => f.name), ["Alert"]);
  assert.deepEqual(files["languages.json"].language.map((l) => l.name), ["Elvish"]);
  // Fireball ships in 5.2, so the link stays.
  assert.deepEqual(files["items.json"].item[0].entries, ["See {@spell Fireball|XPHB}."]);
});

test("links are checked against the same edition's data", () => {
  const files = buildEdition("5.1", { ...srd, items: [{ name: "Wand", source: "DMG", srdEditions: ["5.1"], entries: ["{@spell Fireball|XPHB}"] }] });

  assert.deepEqual(files["items.json"].item[0].entries, ["Fireball"]);
});

test("every file carries the SRD license of its edition", () => {
  for (const edition of ["5.1", "5.2"]) {
    for (const file of Object.values(buildEdition(edition, srd))) {
      assert.equal(file._meta.license, LICENSES[edition]);
      assert.match(file._meta.license, /Creative Commons Attribution 4\.0/);
    }
  }
});
