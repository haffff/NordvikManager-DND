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

test("five kinds, each stored under the key the readers use", () => {
  assert.deepEqual(KINDS.map((k) => [k.kind, k.listKey, k.resourceKey]), [
    ["item", "item", "dnd5e_items_homebrew"],
    ["spell", "spell", "dnd5e_spells_homebrew"],
    ["feat", "feat", "dnd5e_feats_homebrew"],
    ["language", "language", "dnd5e_languages_homebrew"],
    ["monster", "monster", "dnd5e_bestiary_homebrew"],
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
    monster: [toEntry("monster", { ...newForm("monster"), name: "Bog Lurker" })],
  };
  const file = JSON.parse(exportFile(lists));
  assert.deepEqual(file._meta.sources, [{ json: "Homebrew", full: "Homebrew" }]);
  // Each reader picks its own key out of the same file.
  assert.deepEqual([file.item, file.spell, file.feat, file.language], [lists.item, lists.spell, lists.feat, lists.language]);

  const result = importFile(exportFile(lists), { item: [], spell: [], feat: [], language: [], monster: [] });
  assert.deepEqual(result.lists, lists);
  assert.deepEqual([result.added, result.replaced], [5, 0]);
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
  assert.throws(() => importFile('{"class":[]}', empty), /no item, spell, feat, language or monster/);
});

// ── Monsters ──────────────────────────────────────────────────────────────────
import { monsterToProps, parseAction } from "../../dnd5e-monstercard/src/monsterData.js";

const monsterForm = () => ({
  ...newForm("monster"),
  name: "Bog Lurker", size: "L", type: "monstrosity", subtype: "swamp", alignment: "chaotic evil", cr: "3",
  ac: "13", hp: "45", hpFormula: "6d10 + 12", walk: "30", swim: "40", fly: "", climb: "", burrow: "",
  str: "18", dex: "12", con: "15", int: "5", wis: "11", cha: "6", save_con: "+4", save_dex: "",
  skills: "Stealth +3, Perception +2", senses: "darkvision 60 ft.", passive: "12", languages: "",
  immune: "", resist: "cold, poison", vulnerable: "fire", conditionImmune: "poisoned",
  traits: [{ name: "Swamp Camouflage", description: "Advantage on Stealth checks in swamps." }],
  actions: [
    { kind: "action", name: "Bite", type: "attack", recharge: "", attackBonus: "+6", damage: "2d8 + 4", damageType: "Piercing", reach: "10 ft.", range: "", saveDc: "", saveAbility: "", description: "" },
    { kind: "action", name: "Bog Breath", type: "save", recharge: "5–6", attackBonus: "", damage: "4d6", damageType: "Poison", reach: "", range: "15 ft.", saveDc: "13", saveAbility: "CON", description: "" },
    { kind: "reaction", name: "Submerge", type: "other", recharge: "", attackBonus: "", damage: "", damageType: "", reach: "", range: "", saveDc: "", saveAbility: "", description: "The lurker sinks out of sight." },
  ],
});

test("monsters are a homebrew kind, read by the bestiary sources", () => {
  assert.deepEqual(KINDS.find((k) => k.kind === "monster"), { kind: "monster", label: "Monsters", listKey: "monster", resourceKey: "dnd5e_bestiary_homebrew" });
});

test("a homebrew monster fills the monster card with what was typed in", () => {
  const props = Object.fromEntries(monsterToProps(toEntry("monster", monsterForm())).map(({ name, value }) => [name, value]));

  assert.deepEqual(
    [props.monster_name, props.monster_size, props.monster_type, props.monster_subtype, props.monster_alignment, props.cr,
      props.armor, props.hp, props.speed, props.strength_attribute, props.strength_mod, props.saving_throws, props.skills_text,
      props.senses, props.resistances, props.vulnerabilities, props.condition_immunities],
    ["Bog Lurker", "Large", "monstrosity", "swamp", "chaotic evil", "3", "13", "45", "30 ft., swim 40 ft.", "18", "4", "CON +4",
      "Stealth +3, Perception +2", "darkvision 60 ft., passive Perception 12", "cold, poison", "fire", "poisoned"],
  );

  const actions = Array.from({ length: Number(props.actions_count) }, (_, i) => JSON.parse(props[`actions_${i}`]));
  assert.deepEqual(actions.map((a) => a.name), ["Bite", "Bog Breath", "Submerge (Reaction)"]);
  assert.deepEqual([actions[0].attackBonus, actions[0].damage, actions[0].damageType, actions[0].reach], ["+6", "2d8 + 4", "Piercing", "10 ft."]);
  assert.deepEqual([actions[1].saveDc, actions[1].saveAbility, actions[1].recharge, actions[1].damage], ["13", "CON", "5–6", "4d6"]);
  assert.equal(actions[2].description, "The lurker sinks out of sight.");
  assert.equal(JSON.parse(props.traits_0).name, "Swamp Camouflage");
});

test("a homebrew monster's form round-trips, and an SRD monster opens in the form", () => {
  const form = monsterForm();
  const entry = toEntry("monster", form);
  const back = toForm("monster", entry);
  assert.deepEqual({ ...back, actions: back.actions.map(({ description, ...a }) => a) }, {
    ...form, hbId: entry.hbId, actions: form.actions.map(({ description, ...a }) => a),
  });
  assert.equal(back.actions[2].description, "The lurker sinks out of sight.");

  const warrior = srd52("monsters").monster.find((m) => m.name === "Goblin Warrior");
  const opened = toForm("monster", warrior);
  assert.deepEqual([opened.size, opened.type, opened.subtype, opened.alignment, opened.ac, opened.hp, opened.skills], ["S", "fey", "goblinoid", "chaotic neutral", "15", "10", "Stealth +6"]);
  assert.deepEqual(opened.actions.map((a) => [a.kind, a.name, a.type]), [["action", "Scimitar", "attack"], ["action", "Shortbow", "attack"], ["bonus", "Nimble Escape", "other"]]);
});

test("a monster form is checked before saving", () => {
  assert.deepEqual(validate("monster", { ...monsterForm(), name: "", ac: "x", str: "40" }), {
    name: "Name is required.", ac: "Must be a number of 0 or more.", str: "Ability scores are 1 to 30.",
  });
  assert.deepEqual(validate("monster", monsterForm()), {});
});

test("monster actions written by the form are what the card reads", () => {
  const entry = toEntry("monster", monsterForm());
  assert.equal(parseAction(entry.action[0]).type, "attack");
  assert.equal(entry.reaction[0].name, "Submerge");
});
