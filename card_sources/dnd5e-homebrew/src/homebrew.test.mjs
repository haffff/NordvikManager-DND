import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  KINDS, newForm, toEntry, toForm, validate, upsertEntry, removeEntry, exportFile, importFile,
} from "./homebrew.js";
import { spellFromSrd, entriesToText, formatValue, resolveTypeLabel } from "../../dnd5e-nordvikcard/src/srdHelpers.js";
import { featFromSrd } from "../../dnd5e-nordvikcard/src/feats.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const srd52 = (kind) => JSON.parse(fs.readFileSync(path.join(root, `data/srd-5.2/${kind}.json`), "utf8"));
const stripId = ({ id, ...rest }) => rest;

test("four kinds, each stored under the key the readers use", () => {
  assert.deepEqual(KINDS.map((k) => [k.kind, k.listKey, k.resourceKey]), [
    ["item", "item", "dnd5e_items_homebrew"],
    ["spell", "spell", "dnd5e_spells_homebrew"],
    ["feat", "feat", "dnd5e_feats_homebrew"],
    ["language", "language", "dnd5e_languages_homebrew"],
  ]);
});

test("a homebrew weapon is an item the sheet reads as such", () => {
  const form = {
    ...newForm("item"), name: "Moonblade", type: "M", rarity: "rare", weight: "3", valueGp: "15",
    attunement: true, weaponCategory: "martial", dmg1: "1d8", dmgType: "S",
    description: "Glows faintly.\n\nSheds dim light.",
  };
  const entry = toEntry("item", form);

  assert.equal(entry.source, "Homebrew");
  assert.equal(typeof entry.hbId, "string");
  assert.deepEqual(
    [entry.name, entry.type, entry.rarity, entry.weight, entry.value, entry.reqAttune, entry.weaponCategory, entry.dmg1, entry.dmgType],
    ["Moonblade", "M", "rare", 3, 1500, true, "martial", "1d8", "S"],
  );
  assert.equal(resolveTypeLabel(entry.type), "Melee Weapon");
  assert.equal(formatValue(entry.value), "15 gp");
  assert.equal(entriesToText(entry.entries), "Glows faintly.\n\nSheds dim light.");
  assert.deepEqual(toForm("item", entry), { ...form, hbId: entry.hbId });
});

test("other items carry only their own fields; armour has its AC", () => {
  const potion = toEntry("item", { ...newForm("item"), name: "Tonic", type: "P", dmg1: "1d4", dmgType: "F", weaponCategory: "simple" });
  assert.equal("dmg1" in potion, false);
  assert.equal("weaponCategory" in potion, false);
  assert.equal("value" in potion, false, "no price given");

  const armor = toEntry("item", { ...newForm("item"), name: "Bark Mail", type: "MA", ac: "14" });
  assert.equal(armor.ac, 14);
});

test("a homebrew spell reads on the sheet like an SRD one", () => {
  const form = {
    ...newForm("spell"), name: "Feather Bolt", level: "1", school: "V",
    timeAmount: "1", timeUnit: "action", rangeKind: "feet", rangeFeet: "60",
    v: true, s: true, m: true, material: "a feather",
    durationKind: "timed", durationAmount: "1", durationUnit: "minute", concentration: true, ritual: false,
    description: "A bolt of feathers.", higher: "One more bolt per slot level above 1st.",
  };
  const entry = toEntry("spell", form);
  const onSheet = spellFromSrd(entry);

  assert.deepEqual(
    [onSheet.level, onSheet.school, onSheet.castingTime, onSheet.range, onSheet.duration, onSheet.components, onSheet.concentration, onSheet.ritual],
    ["1", "V", "1 action", "60 ft.", "1 minute (C)", "V, S, M (a feather)", true, false],
  );
  assert.equal(onSheet.description, "A bolt of feathers.");
  assert.equal(onSheet.descHigher, "One more bolt per slot level above 1st.");
  assert.deepEqual(toForm("spell", entry), { ...form, hbId: entry.hbId });
});

test("spell ranges and durations of every kind read correctly", () => {
  const range = (rangeKind) => spellFromSrd(toEntry("spell", { ...newForm("spell"), name: "X", rangeKind })).range;
  assert.deepEqual(["self", "touch", "sight", "unlimited"].map(range), ["Self", "Touch", "Sight", "Unlimited"]);

  const duration = (durationKind) => spellFromSrd(toEntry("spell", { ...newForm("spell"), name: "X", durationKind })).duration;
  assert.deepEqual(["instant", "permanent"].map(duration), ["Instantaneous", "Until dispelled"]);

  const ritual = toEntry("spell", { ...newForm("spell"), name: "X", ritual: true, v: true, m: true, material: "" });
  assert.equal(spellFromSrd(ritual).ritual, true);
  assert.equal(spellFromSrd(ritual).components, "V, M");
});

test("a homebrew feat reads on the sheet with its prerequisite and category", () => {
  const form = { ...newForm("feat"), name: "Storm Born", category: "G", prerequisite: "Level 4+", repeatable: false, description: "You resist lightning." };
  const entry = toEntry("feat", form);

  assert.deepEqual(stripId(featFromSrd(entry)), {
    name: "Storm Born", source: "Homebrew", category: "General", prerequisite: "Level 4+", description: "You resist lightning.", notes: "",
  });
  assert.deepEqual(toForm("feat", entry), { ...form, hbId: entry.hbId });
});

test("a homebrew language", () => {
  const form = { ...newForm("language"), name: "Gloomspeak", type: "exotic", typicalSpeakers: "Shades, Wraiths", script: "Umbral" };
  const entry = toEntry("language", form);

  assert.deepEqual({ ...entry, hbId: undefined }, {
    name: "Gloomspeak", source: "Homebrew", hbId: undefined, type: "exotic", typicalSpeakers: ["Shades", "Wraiths"], script: "Umbral",
  });
  assert.deepEqual(toForm("language", entry), { ...form, hbId: entry.hbId });
});

test("editing keeps fields the form doesn't show (e.g. from an imported entry)", () => {
  const imported = { name: "Rope", source: "Homebrew", hbId: "h1", type: "G", property: ["X"], entries: ["Strong."] };
  const edited = toEntry("item", { ...toForm("item", imported), weight: "10" }, imported);

  assert.deepEqual(edited.property, ["X"]);
  assert.equal(edited.weight, 10);
  assert.equal(edited.hbId, "h1");
});

test("forms are checked before saving", () => {
  assert.deepEqual(validate("item", { ...newForm("item"), name: " " }), { name: "Name is required." });
  assert.deepEqual(validate("item", { ...newForm("item"), name: "A", weight: "heavy", valueGp: "-1" }), {
    weight: "Must be a number of 0 or more.", valueGp: "Must be a number of 0 or more.",
  });
  assert.deepEqual(validate("spell", { ...newForm("spell"), name: "A", level: "10" }), { level: "Level is 0 (cantrip) to 9." });
  assert.deepEqual(validate("feat", { ...newForm("feat"), name: "Fine" }), {});
});

test("entries are added, replaced and removed by their id", () => {
  const a = { name: "A", hbId: "1" };
  const b = { name: "B", hbId: "2" };
  let list = upsertEntry([], a);
  list = upsertEntry(list, b);
  list = upsertEntry(list, { name: "A2", hbId: "1" });
  assert.deepEqual(list.map((e) => e.name), ["A2", "B"]);
  assert.deepEqual(removeEntry(list, "1").map((e) => e.name), ["B"]);
});

test("exported homebrew imports back unchanged, and works as a source file for every list", () => {
  const lists = {
    item: [toEntry("item", { ...newForm("item"), name: "Moonblade", type: "M", dmg1: "1d8", dmgType: "S" })],
    spell: [toEntry("spell", { ...newForm("spell"), name: "Feather Bolt" })],
    feat: [toEntry("feat", { ...newForm("feat"), name: "Storm Born" })],
    language: [toEntry("language", { ...newForm("language"), name: "Gloomspeak" })],
  };
  const file = JSON.parse(exportFile(lists));
  assert.deepEqual(file._meta.sources, [{ json: "Homebrew", full: "Homebrew" }]);
  // Each reader picks its own key out of the same file.
  assert.deepEqual([file.item, file.spell, file.feat, file.language], [lists.item, lists.spell, lists.feat, lists.language]);

  const result = importFile(exportFile(lists), { item: [], spell: [], feat: [], language: [] });
  assert.deepEqual(result.lists, lists);
  assert.deepEqual([result.added, result.replaced], [4, 0]);
});

test("importing a data file adds its entries as homebrew, replacing ones of the same name", () => {
  const longsword = srd52("items").item.find((i) => i.name === "Longsword");
  const fireBolt = srd52("spells").spell.find((s) => s.name === "Fire Bolt");
  const current = { item: [{ name: "Longsword", source: "Homebrew", hbId: "old" }], spell: [], feat: [], language: [] };

  const result = importFile(JSON.stringify({ item: [longsword], spell: [fireBolt] }), current);

  assert.deepEqual([result.added, result.replaced], [1, 1]);
  assert.equal(result.lists.item.length, 1);
  assert.equal(result.lists.item[0].dmg1, longsword.dmg1);
  assert.equal(result.lists.item[0].hbId, "old", "replaced in place, same id");
  assert.equal(result.lists.spell[0].source, "Homebrew");
  assert.equal(typeof result.lists.spell[0].hbId, "string");
});

test("a file that isn't in the data format is refused with a reason", () => {
  const empty = { item: [], spell: [], feat: [], language: [] };
  assert.throws(() => importFile("{ not json", empty), /not valid JSON/);
  assert.throws(() => importFile('{"monster":[]}', empty), /no item, spell, feat or language/);
});
