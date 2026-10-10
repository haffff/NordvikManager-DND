import { test } from "node:test";
import assert from "node:assert/strict";
import { sourceKeys, HOMEBREW_SLUG } from "./sourceKeys.js";

test("each configured source maps to its resource, and the game's homebrew is always read too", () => {
  assert.deepEqual(
    sourceKeys([{ name: "SRD 5.2" }, { name: "My Pack!" }], "dnd5e_items_"),
    ["dnd5e_items_srd_5_2", "dnd5e_items_my_pack", "dnd5e_items_homebrew"],
  );
  assert.deepEqual(sourceKeys([], "dnd5e_spells_"), ["dnd5e_spells_homebrew"]);
  assert.deepEqual(sourceKeys(undefined, "dnd5e_feats_"), ["dnd5e_feats_homebrew"]);
});

test("a source named Homebrew isn't read twice", () => {
  assert.deepEqual(sourceKeys([{ name: "Homebrew" }, { name: "SRD 5.2" }], "dnd5e_items_"), ["dnd5e_items_homebrew", "dnd5e_items_srd_5_2"]);
  assert.equal(HOMEBREW_SLUG, "homebrew");
});
