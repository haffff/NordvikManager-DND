import { test } from "node:test";
import assert from "node:assert/strict";
import { prerequisiteText, categoryLabel, featFromSrd, customFeat, searchFeats } from "./feats.js";

test("prerequisites read as text: parts joined, alternatives with 'or'", () => {
  assert.equal(prerequisiteText(undefined), "");
  assert.equal(prerequisiteText([{ level: 4 }]), "Level 4+");
  assert.equal(prerequisiteText([{ ability: [{ str: 13 }] }]), "Strength 13+");
  assert.equal(prerequisiteText([{ ability: [{ str: 13 }, { dex: 13 }] }]), "Strength 13+ or Dexterity 13+");
  assert.equal(prerequisiteText([{ feature: ["Fighting Style"] }]), "Fighting Style feature");
  assert.equal(prerequisiteText([{ level: 19, spellcasting2020: true }]), "Level 19+, Spellcasting or Pact Magic feature");
  assert.equal(
    prerequisiteText([{ level: 4, ability: [{ str: 13 }] }, { level: 4, ability: [{ dex: 13 }] }]),
    "Level 4+, Strength 13+ or Level 4+, Dexterity 13+",
  );
  assert.equal(prerequisiteText([{ other: "Must be a dragon" }]), "Must be a dragon");
});

test("categories have readable names", () => {
  assert.equal(categoryLabel("G"), "General");
  assert.equal(categoryLabel("O"), "Origin");
  assert.equal(categoryLabel("FS"), "Fighting Style");
  assert.equal(categoryLabel("EB"), "Epic Boon");
  assert.equal(categoryLabel(undefined), "");
});

test("a feat added from the data keeps its text, so it survives the source changing", () => {
  const feat = featFromSrd({
    name: "Alert", source: "XPHB", srdEditions: ["5.2"], category: "O",
    entries: ["You gain the following benefits.", { type: "entries", name: "Initiative Proficiency", entries: ["Add your {@variantrule Proficiency|XPHB} Bonus."] }],
  });

  assert.equal(typeof feat.id, "string");
  assert.deepEqual({ ...feat, id: undefined }, {
    id: undefined, name: "Alert", source: "SRD 5.2", category: "Origin", prerequisite: "",
    description: "You gain the following benefits.\n\nAdd your Proficiency Bonus.", notes: "",
  });
});

test("a custom feat starts empty, marked as custom", () => {
  const feat = customFeat("Homebrew Toughness");
  assert.equal(feat.name, "Homebrew Toughness");
  assert.equal(feat.source, "Custom");
  assert.equal(feat.description, "");
});

test("the picker searches names, and filters by SRD edition", () => {
  const feats = [
    { name: "Grappler", srdEditions: ["5.1"] },
    { name: "Grappler", srdEditions: ["5.2"] },
    { name: "Alert", srdEditions: ["5.2"] },
    { name: "Homebrew", source: "HB" },
  ];

  assert.deepEqual(searchFeats(feats, "grap").map((f) => f.srdEditions[0]), ["5.1", "5.2"]);
  assert.deepEqual(searchFeats(feats, "", "5.2").map((f) => f.name), ["Alert", "Grappler", "Homebrew"]);
  // Feats from other sources have no edition and show under every edition.
  assert.deepEqual(searchFeats(feats, "home", "5.1").map((f) => f.name), ["Homebrew"]);
});
