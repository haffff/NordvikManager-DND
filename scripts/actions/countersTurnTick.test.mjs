// The Turn Changed countdown (addon_files/Actions/counters_turn_tick*.json): its RunScript
// steps are run here with Node, and the countdown must match src/counters.js tickRound.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tickRound, newCounter } from "../../card_sources/dnd5e-nordvikcard/src/counters.js";
import { COUNTER_ICONS, tokenIconProps, iconProperty } from "../../card_sources/dnd5e-nordvikcard/src/tokenIcons.js";

const actionsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../addon_files/Actions");
const action = (name) => JSON.parse(fs.readFileSync(path.join(actionsDir, `${name}.json`), "utf8"));
const steps = (name, type) => action(name).content.filter((s) => s.Type === type);

// Runs the action's RunScript step like the backend does: `vars` in, returned object out.
const runScript = (name, vars) => {
  const [step] = steps(name, "RunScript");
  return new Function("vars", step.Data.Script)(Object.freeze(vars));
};

test("it runs on the Turn Changed hook (23), and only goes on when the new turn has a token", () => {
  const hook = action("counters_turn_tick");
  assert.equal(hook.hook, 23);
  assert.equal(hook.isEnabled, true);

  assert.deepEqual(runScript("counters_turn_tick", { Data: { elementId: "e1" } }), { tick_hasToken: 1, tick_elementId: "e1" });
  assert.deepEqual(runScript("counters_turn_tick", { Data: { elementId: null } }), { tick_hasToken: 0, tick_elementId: "" });
  assert.deepEqual(runScript("counters_turn_tick", {}), { tick_hasToken: 0, tick_elementId: "" });
});

test("the token's card is read from its tokenData", () => {
  assert.deepEqual(runScript("counters_turn_tick_token", { tick_tokenData: '{"cardId":"c1","x":1}' }), { tick_hasCard: 1, tick_cardId: "c1" });
  assert.deepEqual(runScript("counters_turn_tick_token", { tick_tokenData: { cardId: "c2" } }), { tick_hasCard: 1, tick_cardId: "c2" });
  for (const tokenData of [null, "", "not json", '{"x":1}']) {
    assert.deepEqual(runScript("counters_turn_tick_token", { tick_tokenData: tokenData }), { tick_hasCard: 0, tick_cardId: "" }, String(tokenData));
  }
});

const counters = [
  { ...newCounter({ name: "Rage", max: 3, reset: "long", durationRounds: 10 }), id: "r", roundsLeft: 1 },
  { ...newCounter({ name: "Bless", max: 1, reset: "none", durationRounds: 10 }), id: "b", roundsLeft: 5 },
  { ...newCounter({ name: "Focus Points", max: 5, reset: "short" }), id: "k" },
  { ...newCounter({ name: "Reaction", max: 1, reset: "round" }), id: "re", current: 0 },
];

test("the countdown matches the sheet's tickRound, and says what ended", () => {
  const result = runScript("counters_turn_tick_card", { tick_counters: JSON.stringify(counters) });
  const expected = tickRound(counters);

  assert.deepEqual(JSON.parse(result.tick_newCounters), expected.counters);
  assert.equal(result.tick_changed, 1);
  assert.equal(result.tick_hasEnded, 1);
  assert.equal(result.tick_endedText, "Rage");
});

test("a spent per-round counter alone is refilled and written", () => {
  const spent = [{ ...counters[3] }];
  const result = runScript("counters_turn_tick_card", { tick_counters: JSON.stringify(spent) });
  assert.deepEqual(JSON.parse(result.tick_newCounters), tickRound(spent).counters);
  assert.deepEqual([result.tick_changed, result.tick_hasEnded], [1, 0]);
});

test("nothing active, or nothing readable: nothing to write", () => {
  const idle = [{ ...counters[2] }];
  for (const stored of [JSON.stringify(idle), "[]", "", "broken", null]) {
    const result = runScript("counters_turn_tick_card", { tick_counters: stored });
    assert.equal(result.tick_changed, 0, String(stored));
    assert.equal(result.tick_hasEnded, 0, String(stored));
  }
});

test("the actions are chained, write the card's counters and announce what ended", () => {
  const [guard] = steps("counters_turn_tick", "If");
  assert.equal(guard.Data.ActionTrue, "dnd5e/counters_turn_tick_token");

  const [getElement] = steps("counters_turn_tick_token", "GetData");
  assert.deepEqual([getElement.Data.Type, getElement.Data.Id, getElement.Data.SingleElement], ["Element", "%tick_elementId%", true]);
  const [detail] = steps("counters_turn_tick_token", "GetDetail");
  assert.deepEqual([detail.Data.DetailName, detail.Data.IsElement, detail.Data.Output], ["tokenData", true, "tick_tokenData"]);
  assert.equal(steps("counters_turn_tick_token", "If")[0].Data.ActionTrue, "dnd5e/counters_turn_tick_card");

  const [read] = steps("counters_turn_tick_card", "GetPropertyValue");
  assert.deepEqual([read.Data.ParentId, read.Data.PropertyName, read.Data.Output], ["%tick_cardId%", "dnd5e_counters", "tick_counters"]);
  assert.equal(steps("counters_turn_tick_card", "If")[0].Data.ActionTrue, "dnd5e/counters_turn_tick_apply");

  const [write] = steps("counters_turn_tick_apply", "SetProperty");
  assert.deepEqual([write.Data.ParentId, write.Data.PropertyName, write.Data.PropertyValue], ["%tick_cardId%", "dnd5e_counters", "%tick_newCounters%"]);
  assert.equal(steps("counters_turn_tick_apply", "If")[0].Data.ActionTrue, "dnd5e/counters_turn_tick_ended");

  const [chat] = steps("counters_turn_tick_ended", "SendChat");
  assert.match(chat.Data.Message, /%tick_endedText%/);

  // Every If condition compares a 1/0 flag the scripts return.
  for (const name of ["counters_turn_tick", "counters_turn_tick_token", "counters_turn_tick_card", "counters_turn_tick_apply"]) {
    assert.match(steps(name, "If")[0].Data.Condition, /^%v:tick_\w+% = 1$/, name);
  }
});

test("the token's counter icons follow the countdown, like the sheet's tokenIconProps", () => {
  const raging = [
    { ...newCounter({ name: "Rage", max: 3, reset: "long", durationRounds: 10, icon: "rage" }), id: "r", roundsLeft: 1 },
    { ...newCounter({ name: "Reaction", max: 1, reset: "round", icon: "hourglass" }), id: "re", current: 0, showOnToken: "uses" },
  ];
  const result = runScript("counters_turn_tick_card", { tick_counters: JSON.stringify(raging) });
  const expected = tokenIconProps(tickRound(raging).counters);

  for (const { key } of COUNTER_ICONS) {
    assert.equal(result[`tick_icon_${key}`], expected[iconProperty(key)], key);
  }
  // Rage ran out, the reaction came back.
  assert.deepEqual([result.tick_icon_rage, result.tick_icon_hourglass], ["false", "true"]);
});

test("the apply action writes every counter icon's property", () => {
  const [write] = steps("counters_turn_tick_apply", "SetProperties");
  assert.equal(write.Data.ParentId, "%tick_cardId%");
  const lines = write.Data.Properties.split("\n");
  assert.deepEqual(lines, COUNTER_ICONS.map(({ key }) => `${iconProperty(key)}=%v:tick_icon_${key}%`));
});
