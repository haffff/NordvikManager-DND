import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  monsterToProps, parseAction, actionEntry, renderTags, alignmentText, damageListText,
} from "./monsterData.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const monsters = (edition) => JSON.parse(fs.readFileSync(path.join(root, `data/srd-${edition}/monsters.json`), "utf8")).monster;
const find = (edition, name) => monsters(edition).find((m) => m.name === name);
const propsOf = (entry) => Object.fromEntries(monsterToProps(entry).map(({ name, value }) => [name, value]));
const list = (props, name) =>
  Array.from({ length: Number(props[`${name}_count`]) }, (_, i) => JSON.parse(props[`${name}_${i}`]));
const withoutId = ({ id, ...rest }) => rest;

test("action markup reads as stat block text", () => {
  assert.equal(
    renderTags("{@atk mw} {@hit 4} to hit, reach 5 ft., one target. {@h}5 ({@damage 1d6 + 2}) slashing damage."),
    "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.",
  );
  assert.equal(
    renderTags("{@actSave dex} {@dc 21}, each creature in a 60-foot {@variantrule Cone [Area of Effect]|XPHB|Cone}. {@actSaveFail} 59 ({@damage 17d6}) Fire damage. {@actSaveSuccess} Half damage."),
    "Dexterity Saving Throw: DC 21, each creature in a 60-foot Cone. Failure: 59 (17d6) Fire damage. Success: Half damage.",
  );
  assert.equal(renderTags("{@atkr m,r} {@hit 3}"), "Melee or Ranged Attack Roll: +3");
  assert.equal(renderTags("Fire Breath {@recharge 5}"), "Fire Breath (Recharge 5–6)");
  assert.equal(renderTags("{@spell fire bolt} and {@b bold}"), "fire bolt and bold");
});

test("alignments read like the card's list", () => {
  assert.equal(alignmentText(["C", "N"]), "chaotic neutral");
  assert.equal(alignmentText(["N"]), "neutral");
  assert.equal(alignmentText(["U"]), "unaligned");
  assert.equal(alignmentText(["A"]), "any alignment");
  assert.equal(alignmentText(["L", "NX", "C", "NY", "E"]), "any non-good");
  assert.equal(alignmentText(["NX", "C", "G", "NY", "E"]), "any non-lawful");
  assert.equal(alignmentText(["C", "G", "NY", "E"]), "any chaotic");
  assert.equal(alignmentText(["L", "NX", "C", "E"]), "any evil");
  assert.equal(
    alignmentText([{ alignment: ["N", "G"], chance: 50 }, { alignment: ["N", "E"], chance: 50 }]),
    "neutral good (50%) or neutral evil (50%)",
  );
});

test("damage and condition lists, with grouped notes", () => {
  assert.equal(damageListText(["fire"], "immune"), "fire");
  assert.equal(
    damageListText(["psychic", { immune: ["bludgeoning", "piercing", "slashing"], note: "from nonmagical attacks", cond: true }], "immune"),
    "psychic; bludgeoning, piercing, slashing from nonmagical attacks",
  );
  assert.equal(damageListText([{ conditionImmune: ["charmed"], note: "(with Mind Blank)" }], "conditionImmune"), "charmed (with Mind Blank)");
  assert.equal(damageListText(undefined, "resist"), "");
});

test("attack actions of both editions fill the card's attack fields", () => {
  const goblin = parseAction(find("5.1", "Goblin").action[0]);
  assert.deepEqual(withoutId(goblin), {
    name: "Scimitar", type: "attack", recharge: "", attackBonus: "+4", damage: "1d6 + 2", damageType: "Slashing",
    reach: "5 ft.", range: "", saveDc: "", saveAbility: "",
    description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.",
  });

  const bow = parseAction(find("5.2", "Goblin Warrior").action[1]);
  assert.deepEqual([bow.type, bow.attackBonus, bow.damage, bow.damageType, bow.range, bow.reach], ["attack", "+4", "1d6 + 2", "Piercing", "80/320 ft.", ""]);
});

test("saving throw actions of both editions, with recharge", () => {
  const breath52 = parseAction(find("5.2", "Adult Red Dragon").action.find((a) => /Breath/.test(a.name)));
  assert.deepEqual(
    [breath52.name, breath52.type, breath52.recharge, breath52.saveDc, breath52.saveAbility, breath52.damage, breath52.damageType],
    ["Fire Breath", "save", "5–6", "21", "DEX", "17d6", "Fire"],
  );

  const breath51 = parseAction(find("5.1", "Adult Red Dragon").action.find((a) => /Breath/.test(a.name)));
  assert.deepEqual(
    [breath51.type, breath51.saveDc, breath51.saveAbility, breath51.damage, breath51.damageType],
    ["save", "21", "DEX", "18d6", "Fire"],
  );
});

test("anything else is an 'other' action with its text", () => {
  const multi = parseAction({ name: "Multiattack", entries: ["The dragon makes three {@b Rend} attacks."] });
  assert.deepEqual([multi.type, multi.description, multi.attackBonus, multi.damage], ["other", "The dragon makes three Rend attacks.", "", ""]);
});

test("a homebrew action written from the card's fields reads back the same", () => {
  const attack = {
    name: "Bite", type: "attack", recharge: "", attackBonus: "+5", damage: "2d6 + 3", damageType: "Piercing",
    reach: "10 ft.", range: "", saveDc: "", saveAbility: "", description: "",
  };
  const save = {
    name: "Spit", type: "save", recharge: "5–6", attackBonus: "", damage: "4d8", damageType: "Acid",
    reach: "", range: "30 ft.", saveDc: "13", saveAbility: "CON", description: "",
  };
  for (const fields of [attack, save]) {
    const back = parseAction(actionEntry(fields));
    assert.deepEqual({ ...withoutId(back), description: "" }, fields);
  }
  const other = { name: "Roar", type: "other", recharge: "", attackBonus: "", damage: "", damageType: "", reach: "", range: "", saveDc: "", saveAbility: "", description: "Everyone is scared." };
  assert.deepEqual(withoutId(parseAction(actionEntry(other))), other);
});

test("Goblin Warrior (SRD 5.2) fills the monster card", () => {
  const props = propsOf(find("5.2", "Goblin Warrior"));

  assert.deepEqual(
    {
      monster_name: props.monster_name, monster_size: props.monster_size, monster_type: props.monster_type,
      monster_subtype: props.monster_subtype, monster_alignment: props.monster_alignment, cr: props.cr,
      armor: props.armor, hp: props.hp, maxhp: props.maxhp, speed: props.speed, senses: props.senses,
      languages: props.languages, skills_text: props.skills_text, saving_throws: props.saving_throws,
      strength_attribute: props.strength_attribute, strength_mod: props.strength_mod,
      dexterity_attribute: props.dexterity_attribute, dexterity_mod: props.dexterity_mod,
    },
    {
      monster_name: "Goblin Warrior", monster_size: "Small", monster_type: "fey", monster_subtype: "goblinoid",
      monster_alignment: "chaotic neutral", cr: "1/4", armor: "15", hp: "10", maxhp: "10", speed: "30 ft.",
      senses: "Darkvision 60 ft., passive Perception 9", languages: "Common, Goblin", skills_text: "Stealth +6",
      saving_throws: "", strength_attribute: "8", strength_mod: "-1", dexterity_attribute: "15", dexterity_mod: "2",
    },
  );

  const actions = list(props, "actions");
  assert.deepEqual(actions.map((a) => [a.name, a.type]), [["Scimitar", "attack"], ["Shortbow", "attack"], ["Nimble Escape (Bonus Action)", "other"]]);
  assert.equal(props.actions_notify !== undefined, true);
  assert.deepEqual(list(props, "traits"), []);
});

test("Goblin (SRD 5.1): armour from a list, traits", () => {
  const props = propsOf(find("5.1", "Goblin"));
  assert.equal(props.armor, "15");
  assert.equal(props.monster_alignment, "neutral evil");
  assert.deepEqual(list(props, "traits").map((t) => t.name), ["Nimble Escape"]);
  assert.match(list(props, "traits")[0].description, /Disengage or Hide action/);
});

test("speeds, saves, immunities and spellcasting", () => {
  const dragon = propsOf(find("5.2", "Adult Red Dragon"));
  assert.equal(dragon.speed, "40 ft., climb 40 ft., fly 80 ft.");
  assert.equal(dragon.saving_throws, "DEX +6, WIS +7");
  assert.equal(dragon.immunities, "fire");
  // 5.2 lists the dragon's spellcasting with its actions.
  const casting = list(dragon, "actions").find((a) => a.name === "Spellcasting");
  assert.match(casting.description, /At will: Command \(level 2 version\), Detect Magic, Scorching Ray/);
  assert.match(casting.description, /1\/day: Fireball/);

  const mage = propsOf(find("5.1", "Mage"));
  const spells = list(mage, "traits").find((t) => t.name === "Spellcasting");
  assert.match(spells.description, /Cantrips \(at will\): fire bolt, light, mage hand, prestidigitation/);
  assert.match(spells.description, /1st level \(4 slots\): detect magic/);
});

test("every SRD monster maps without errors and with a name and some actions", () => {
  for (const edition of ["5.1", "5.2"]) {
    for (const monster of monsters(edition)) {
      const props = propsOf(monster);
      assert.equal(props.monster_name, monster.name);
      for (const value of Object.values(props)) assert.equal(typeof value, "string", monster.name);
      assert.doesNotMatch(JSON.stringify(props), /\{@/, `${monster.name}: markup left in the card text`);
    }
  }
});
