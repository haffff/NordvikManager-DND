import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseCounters, newCounter, adjust, setValue, rest, activate, deactivate, tickRound, PRESETS,
} from "./counters.js";

const rage = () => ({ ...newCounter({ name: "Rage", max: 3, reset: "long", durationRounds: 10 }), id: "rage" });
const ki = () => ({ ...newCounter({ name: "Focus Points", max: 5, reset: "short" }), id: "ki" });
const luck = () => ({ ...newCounter({ name: "Luck", max: 2, reset: "none" }), id: "luck" });
const byId = (counters, id) => counters.find((c) => c.id === id);

test("stored counters are read back, and anything broken reads as none", () => {
  assert.deepEqual(parseCounters('[{"id":"a","name":"Rage","current":1,"max":3}]').map((c) => c.name), ["Rage"]);
  assert.deepEqual(parseCounters(undefined), []);
  assert.deepEqual(parseCounters("not json"), []);
  assert.deepEqual(parseCounters('{"not":"a list"}'), []);
});

test("a new counter starts full and inactive", () => {
  const c = newCounter({ name: "Rage", max: 3, reset: "long", durationRounds: 10 });
  assert.equal(typeof c.id, "string");
  assert.deepEqual({ ...c, id: undefined }, { id: undefined, name: "Rage", current: 3, max: 3, reset: "long", durationRounds: 10, roundsLeft: 0 });
});

test("spending and regaining stay between 0 and max", () => {
  let counters = [ki()];
  counters = adjust(counters, "ki", -2);
  assert.equal(byId(counters, "ki").current, 3);
  counters = adjust(counters, "ki", -9);
  assert.equal(byId(counters, "ki").current, 0);
  counters = adjust(counters, "ki", 99);
  assert.equal(byId(counters, "ki").current, 5);
  assert.equal(byId(setValue(counters, "ki", 2), "ki").current, 2);
  assert.equal(byId(setValue(counters, "ki", "abc"), "ki").current, 5, "not a number: unchanged");
});

test("a counter without a max only stops at 0", () => {
  const tally = { ...newCounter({ name: "Tally", max: 0, reset: "none" }), id: "t" };
  assert.equal(byId(adjust([tally], "t", 7), "t").current, 7);
  assert.equal(byId(adjust([tally], "t", -1), "t").current, 0);
});

test("other counters are left alone (and the input isn't changed)", () => {
  const counters = [ki(), luck()];
  const after = adjust(counters, "ki", -1);
  assert.equal(byId(after, "luck"), counters[1]);
  assert.equal(counters[0].current, 5);
});

test("a short rest refills short-rest counters; a long rest refills those and long-rest ones", () => {
  const spent = [rage(), ki(), luck()].map((c) => ({ ...c, current: 0 }));

  const afterShort = rest(spent, "short");
  assert.deepEqual(afterShort.map((c) => c.current), [0, 5, 0]);

  const afterLong = rest(spent, "long");
  assert.deepEqual(afterLong.map((c) => c.current), [3, 5, 0]);
});

test("activating spends a use and starts the duration; with no uses left nothing happens", () => {
  let counters = activate([rage()], "rage");
  assert.deepEqual([byId(counters, "rage").current, byId(counters, "rage").roundsLeft], [2, 10]);

  const empty = [{ ...rage(), current: 0 }];
  assert.deepEqual(activate(empty, "rage"), empty);

  counters = deactivate(counters, "rage");
  assert.equal(byId(counters, "rage").roundsLeft, 0);
});

test("each of the character's turns counts active durations down and reports what ended", () => {
  let counters = [{ ...rage(), roundsLeft: 2 }, ki()];

  let tick = tickRound(counters);
  assert.equal(byId(tick.counters, "rage").roundsLeft, 1);
  assert.deepEqual(tick.ended, []);

  tick = tickRound(tick.counters);
  assert.equal(byId(tick.counters, "rage").roundsLeft, 0);
  assert.deepEqual(tick.ended, ["Rage"]);

  tick = tickRound(tick.counters);
  assert.deepEqual(tick.ended, [], "already over: not reported again");
});

test("a rest ends anything still active", () => {
  const counters = rest([{ ...rage(), roundsLeft: 4 }], "long");
  assert.equal(counters[0].roundsLeft, 0);
});

test("presets cover the SRD class resources, each with how it resets", () => {
  const names = PRESETS.map((p) => p.name);
  for (const name of ["Rage", "Bardic Inspiration", "Channel Divinity", "Second Wind", "Action Surge"]) {
    assert.ok(names.includes(name), name);
  }
  for (const p of PRESETS) assert.ok(["short", "long", "none"].includes(p.reset), p.name);
  assert.equal(PRESETS.find((p) => p.name === "Rage").durationRounds, 10);
});
