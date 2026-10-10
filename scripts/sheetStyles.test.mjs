// The character sheet in the game loads only addon_files/Resources/shared.css (its
// template's additionalResources), not the card's own App.css: every class the
// Counters and Feats tabs use must be defined there.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const shared = read("addon_files/Resources/shared.css");

test("the character template loads shared.css", () => {
  assert.ok(JSON.parse(read("addon_files/Templates/character_template.json")).additionalResources.includes("dnd5e_shared.css"));
});

test("every counters/feats class of the sheet is styled in shared.css", () => {
  for (const file of ["Counters5E.jsx", "Feats5E.jsx"]) {
    const source = read(`card_sources/dnd5e-nordvikcard/src/components/${file}`);
    const classes = new Set(source.match(/dnd5e_(?:ctr|feat)_[a-z_]+/g) ?? []);
    for (const name of classes) {
      // A name ending in "_" is the start of classes built in code (dnd5e_ctr_badge_${reset}).
      const defined = name.endsWith("_") ? shared.includes(`.${name}`) : new RegExp(`\\.${name}\\b`).test(shared);
      assert.ok(defined, `${file}: .${name} missing from shared.css`);
    }
  }
});
