import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildToken, baseAdditions } from "./buildTokens.mjs";
import { COUNTER_ICONS, CONDITIONS, iconProperty } from "../../card_sources/dnd5e-nordvikcard/src/tokenIcons.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const current = JSON.parse(fs.readFileSync(path.join(root, "addon_files/Resources/token_character.json"), "utf8"));
const visibleDep = (addition) => addition.tokenData?.propDeps?.find((d) => d.objectProperty === "visible");

test("the base parts (image, HP bar, name, open card) are kept as they are", () => {
  const base = baseAdditions(current);
  assert.deepEqual(base.map((a) => a.name), ["hp_bar_bg", "hp_bar_fill", "name_label", "open_card_btn"]);
  const token = buildToken(current, "character");
  assert.deepEqual(token.additions.slice(0, 4), base);
  assert.deepEqual(token.object, current.object);
  assert.deepEqual(token.editableProps, current.editableProps);
});

test("every counter icon has a hidden right-top part shown by its dnd5e_icon_<key> property", () => {
  const token = buildToken(current, "character");
  for (const { key, iconName } of COUNTER_ICONS) {
    const part = token.additions.find((a) => visibleDep(a)?.dtoProperty === iconProperty(key));
    assert.ok(part, key);
    assert.deepEqual(
      [part.type, part.iconPack, part.iconName, part.visible, part.tokenData.anchor, part.tokenData.maskGroup],
      ["reactIcon", "gi", iconName, false, "right-top", "counters"],
    );
    assert.deepEqual(visibleDep(part), { dtoProperty: iconProperty(key), objectProperty: "visible", type: "bool", source: "card" });
  }
});

test("every SRD condition is in the icon picker and has its part", () => {
  const token = buildToken(current, "character");
  assert.deepEqual(token.assignableIcons.map((i) => i.id), CONDITIONS.map((c) => c.id));
  for (const icon of token.assignableIcons) {
    assert.deepEqual([icon.iconPack, icon.source], ["gi", "card"]);
    const part = token.additions.find((a) => visibleDep(a)?.dtoProperty === icon.dtoProperty);
    assert.ok(part, icon.id);
    assert.deepEqual([part.iconName, part.tokenData.maskGroup, part.visible], [icon.iconName, "conditions", false]);
  }
});

test("part names are unique, and building again changes nothing", () => {
  const token = buildToken(current, "character");
  const names = token.additions.map((a) => a.name);
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(buildToken(token, "character"), token);
});

test("the monster token labels with the monster's name; the character token with the character's", () => {
  const label = (token) => token.additions.find((a) => a.name === "name_label").tokenData.propDeps[0].dtoProperty;
  assert.equal(label(buildToken(current, "character")), "character_name");
  assert.equal(label(buildToken(current, "monster")), "monster_name");
});

test("counter icons with their own colour (the status dots) keep it on the token", () => {
  const token = buildToken(current, "character");
  for (const icon of COUNTER_ICONS.filter((i) => i.fill)) {
    assert.equal(token.additions.find((a) => a.name === `counter_icon_${icon.key}`).fill, icon.fill, icon.key);
  }
});
