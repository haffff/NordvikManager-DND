import { test } from "node:test";
import assert from "node:assert/strict";
import { crValue, crOf, typeName, searchMonsters, filterOptions } from "./monsterSearch.js";

const monsters = [
  { name: "Goblin", cr: "1/4", type: { type: "humanoid", tags: ["goblinoid"] }, srdEditions: ["5.1"] },
  { name: "Goblin Warrior", cr: "1/4", type: { type: "fey" }, srdEditions: ["5.2"] },
  { name: "Adult Red Dragon", cr: { cr: "17", lair: "18" }, type: "dragon", srdEditions: ["5.2"] },
  { name: "Mud Thing", cr: "2", type: "ooze" }, // homebrew: no edition
];

test("challenge ratings sort by value, fractions included", () => {
  assert.deepEqual(["1/2", "0", "17", "1/8", "2", "1/4"].sort((a, b) => crValue(a) - crValue(b)), ["0", "1/8", "1/4", "1/2", "2", "17"]);
  assert.equal(crOf(monsters[2]), "17");
  assert.equal(typeName(monsters[0]), "humanoid");
});

test("search by name, type, challenge rating and SRD edition; homebrew shows under every edition", () => {
  const names = (filters) => searchMonsters(monsters, filters).map((m) => m.name);

  assert.deepEqual(names({ query: "gob" }), ["Goblin", "Goblin Warrior"]);
  assert.deepEqual(names({ type: "dragon" }), ["Adult Red Dragon"]);
  assert.deepEqual(names({ cr: "1/4" }), ["Goblin", "Goblin Warrior"]);
  assert.deepEqual(names({ edition: "5.2" }), ["Goblin Warrior", "Mud Thing", "Adult Red Dragon"]);
});

test("results are ordered by challenge rating, then name", () => {
  assert.deepEqual(searchMonsters(monsters, {}).map((m) => m.name), ["Goblin", "Goblin Warrior", "Mud Thing", "Adult Red Dragon"]);
});

test("the filters offer what the data has", () => {
  assert.deepEqual(filterOptions(monsters), {
    types: ["dragon", "fey", "humanoid", "ooze"],
    crs: ["1/4", "2", "17"],
    editions: ["5.1", "5.2"],
  });
});
