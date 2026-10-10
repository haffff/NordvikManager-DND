// Counters on the character sheet (Rage uses, Focus Points, Bardic Inspiration, ...),
// stored together as one JSON list in the card's "dnd5e_counters" property, so an
// action can read and write them too (the Turn Changed countdown).
//
// A counter: { id, name, current, max, reset: "short" | "long" | "none",
//              durationRounds: number | null, roundsLeft: number }
// max 0 = no upper limit. durationRounds: how long one activation lasts (Rage: 10).
import { mkId } from "./srdHelpers.js";

export const COUNTERS_PROPERTY = "dnd5e_counters";

/** The stored list; anything unreadable reads as no counters. */
export const parseCounters = (value) => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const newCounter = ({ name, max = 0, reset = "long", durationRounds = null }) => ({
  id: mkId(),
  name,
  current: max,
  max,
  reset,
  durationRounds: durationRounds || null,
  roundsLeft: 0,
});

const clamp = (counter, value) => Math.max(0, counter.max > 0 ? Math.min(counter.max, value) : value);

const change = (counters, id, fn) => counters.map((c) => (c.id === id ? fn(c) : c));

export const adjust = (counters, id, delta) => change(counters, id, (c) => ({ ...c, current: clamp(c, (c.current ?? 0) + delta) }));

export const setValue = (counters, id, value) => {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? counters : change(counters, id, (c) => ({ ...c, current: clamp(c, n) }));
};

/** Short rest refills "short" counters; long rest refills "short" and "long". Either ends active durations. */
export const rest = (counters, kind) =>
  counters.map((c) => {
    const refills = c.reset === "short" || (kind === "long" && c.reset === "long");
    return { ...c, current: refills ? c.max : c.current, roundsLeft: 0 };
  });

/** Spends one use and starts the duration (e.g. enter a Rage). No uses left: nothing happens. */
export const activate = (counters, id) =>
  change(counters, id, (c) =>
    (c.current ?? 0) > 0 ? { ...c, current: c.current - 1, roundsLeft: c.durationRounds || 0 } : c);

export const deactivate = (counters, id) => change(counters, id, (c) => ({ ...c, roundsLeft: 0 }));

/**
 * One of the character's turns started: active durations count down by one.
 * Returns the new list and the names of what just ran out. The Turn Changed action
 * (addon_files/Actions/counters_turn_tick.json) runs the same logic in its script.
 */
export const tickRound = (counters) => {
  const ended = [];
  const next = counters.map((c) => {
    if (!(c.roundsLeft > 0)) return c;
    const roundsLeft = c.roundsLeft - 1;
    if (roundsLeft === 0) ended.push(c.name);
    return { ...c, roundsLeft };
  });
  return { counters: next, ended };
};

// SRD class resources. The player sets max (it depends on level and ability scores).
export const PRESETS = [
  { name: "Rage", reset: "long", durationRounds: 10 },
  { name: "Bardic Inspiration", reset: "long" },
  { name: "Channel Divinity", reset: "short" },
  { name: "Wild Shape", reset: "short" },
  { name: "Focus Points", reset: "short" },
  { name: "Sorcery Points", reset: "long" },
  { name: "Second Wind", reset: "short" },
  { name: "Action Surge", reset: "short" },
  { name: "Lay on Hands", reset: "long" },
  { name: "Arcane Recovery", reset: "long" },
];
