import { test } from "node:test";
import assert from "node:assert/strict";
import * as gi from "react-icons/gi";
import { COUNTER_ICONS, CONDITIONS, iconProperty, tokenIconProps, changedIconProps, iconOf } from "./tokenIcons.js";
import { newCounter, PRESETS } from "./counters.js";

test("every palette and condition icon exists in the token icon pack", () => {
  for (const { iconName } of [...COUNTER_ICONS, ...CONDITIONS]) assert.equal(typeof gi[iconName], "function", iconName);
  assert.equal(new Set(COUNTER_ICONS.map((i) => i.key)).size, COUNTER_ICONS.length);
});

test("the SRD conditions, plus Concentration, keep the existing status_poisoned property", () => {
  assert.deepEqual(CONDITIONS.map((c) => c.id), [
    "blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", "incapacitated", "invisible",
    "paralyzed", "petrified", "poisoned", "prone", "restrained", "stunned", "unconscious", "concentration",
  ]);
  assert.equal(CONDITIONS.find((c) => c.id === "poisoned").dtoProperty, "status_poisoned");
});

const counter = (over) => ({ ...newCounter({ name: "X", max: 3, reset: "long" }), ...over });

test("an icon is on while a counter using it is on: active (rounds left) or with uses left", () => {
  const props = tokenIconProps([
    counter({ icon: "rage", showOnToken: "active", roundsLeft: 4 }),
    counter({ icon: "hourglass", showOnToken: "uses", current: 1 }),
    counter({ icon: "fist", showOnToken: "uses", current: 0 }),
    counter({ icon: "flame", showOnToken: "active", roundsLeft: 0 }),
    counter({ icon: "holy", showOnToken: "never", roundsLeft: 3 }),
  ]);

  assert.equal(props[iconProperty("rage")], "true");
  assert.equal(props[iconProperty("hourglass")], "true");
  assert.equal(props[iconProperty("fist")], "false");
  assert.equal(props[iconProperty("flame")], "false");
  assert.equal(props[iconProperty("holy")], "false");
  // Every palette icon has a value, so turning one off writes "false".
  assert.deepEqual(Object.keys(props).sort(), COUNTER_ICONS.map((i) => iconProperty(i.key)).sort());
});

test("two counters sharing an icon: it shows while either is on", () => {
  const props = tokenIconProps([
    counter({ icon: "heart", showOnToken: "uses", current: 0 }),
    counter({ icon: "heart", showOnToken: "uses", current: 2 }),
  ]);
  assert.equal(props[iconProperty("heart")], "true");
});

test("only the icons that changed are written", () => {
  const before = [counter({ id: "r", icon: "rage", showOnToken: "active", roundsLeft: 0 })];
  const after = [counter({ id: "r", icon: "rage", showOnToken: "active", roundsLeft: 10 })];
  assert.deepEqual(changedIconProps(before, after), { [iconProperty("rage")]: "true" });
  assert.deepEqual(changedIconProps(after, after), {});
});

test("old counters without the new fields show nothing; presets come with fitting icons", () => {
  assert.deepEqual(iconOf({ name: "Old" }), { icon: "", showOnToken: "never" });
  assert.equal(PRESETS.find((p) => p.name === "Rage").icon, "rage");
  for (const p of PRESETS.filter((p) => p.icon)) assert.ok(COUNTER_ICONS.some((i) => i.key === p.icon), p.name);
});

test("a new counter with a duration shows its icon while active; others don't by default", () => {
  assert.equal(newCounter({ name: "Rage", max: 3, durationRounds: 10, icon: "rage" }).showOnToken, "active");
  assert.equal(newCounter({ name: "Ki", max: 5 }).showOnToken, "never");
  assert.equal(newCounter({ name: "Rage", max: 3, durationRounds: 10, icon: "rage" }).icon, "rage");
});

test("the sheet has a component for every palette icon", async () => {
  const { counterIconComponent } = await import("./counterIcons.js");
  for (const { key } of COUNTER_ICONS) assert.equal(typeof counterIconComponent(key), "function", key);
  assert.equal(counterIconComponent(""), undefined);
});

test("four coloured status dots anyone can give a counter", () => {
  const dots = COUNTER_ICONS.filter((i) => i.key.startsWith("dot_"));
  assert.deepEqual(dots.map((d) => d.key), ["dot_yellow", "dot_red", "dot_blue", "dot_green"]);
  for (const dot of dots) {
    assert.equal(dot.iconName, "GiPlainCircle");
    assert.match(dot.fill, /^rgba?\(/);
  }
});
