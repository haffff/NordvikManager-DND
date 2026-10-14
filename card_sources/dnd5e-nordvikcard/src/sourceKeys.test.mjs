import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sourceKeys, HOMEBREW_SLUG, visibleEntries, viewerIsGM } from "./sourceKeys.js";

const here = path.dirname(fileURLToPath(import.meta.url));

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

test("hidden entries (GM-only homebrew) are left out of a player's lists, the GM sees them", () => {
  const list = [{ name: "Longsword" }, { name: "Secret Blade", hidden: true }];
  assert.deepEqual(visibleEntries(list, false).map((e) => e.name), ["Longsword"]);
  assert.deepEqual(visibleEntries(list, true).map((e) => e.name), ["Longsword", "Secret Blade"]);
});

test("the viewer is the GM only when the app says so", async () => {
  const api = (answer) => ({ ClientMediator: { sendCommandAsync: async (panel, command) => (panel === "Game" && command === "GetIsGM" ? answer() : undefined) } });
  assert.equal(await viewerIsGM(api(() => true)), true);
  assert.equal(await viewerIsGM(api(() => false)), false);
  assert.equal(await viewerIsGM(api(() => undefined)), false); // an app that doesn't allow the command
  assert.equal(await viewerIsGM(api(() => { throw new Error("no"); })), false);
});

test("the item and monster creators' copies of this file match it", () => {
  const read = (card) => fs.readFileSync(path.join(here, `../../${card}/src/sourceKeys.js`), "utf8").replace(/\r\n/g, "\n");
  const body = (text) => text.split("\n").filter((l) => !l.startsWith("// Copy of")).join("\n");
  for (const card of ["dnd5e-itemcreator", "dnd5e-monstercreator"]) assert.equal(body(read(card)), body(read("dnd5e-nordvikcard")), card);
});
