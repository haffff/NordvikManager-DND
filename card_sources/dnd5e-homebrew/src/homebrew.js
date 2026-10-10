// The game's homebrew: items, spells, feats and languages made in the 5E Homebrew view.
// Each kind is one game resource in the addon's data format ({ item: [...] }, ...) under the key
// a source named "Homebrew" would have, so the sheets read it next to their sources
// (dnd5e-nordvikcard/src/sourceKeys.js). Forms hold only what the cards show; the
// sheet's own readers (srdHelpers.js, feats.js) are reused so the two can't drift.
import { entriesToText, mkId } from "../../dnd5e-nordvikcard/src/srdHelpers.js";
import { prerequisiteText } from "../../dnd5e-nordvikcard/src/feats.js";

export const HOMEBREW_SOURCE = "Homebrew";

export const KINDS = [
  { kind: "item", label: "Items", listKey: "item", resourceKey: "dnd5e_items_homebrew" },
  { kind: "spell", label: "Spells", listKey: "spell", resourceKey: "dnd5e_spells_homebrew" },
  { kind: "feat", label: "Feats", listKey: "feat", resourceKey: "dnd5e_feats_homebrew" },
  { kind: "language", label: "Languages", listKey: "language", resourceKey: "dnd5e_languages_homebrew" },
];

export const WEAPON_TYPES = ["M", "R"];
export const ARMOR_TYPES = ["LA", "MA", "HA", "S"];

const FORMS = {
  item: {
    hbId: "", name: "", type: "G", rarity: "none", weight: "", valueGp: "", attunement: false,
    weaponCategory: "", dmg1: "", dmgType: "", ac: "", description: "",
  },
  spell: {
    hbId: "", name: "", level: "0", school: "V", timeAmount: "1", timeUnit: "action",
    rangeKind: "feet", rangeFeet: "30", v: false, s: false, m: false, material: "",
    durationKind: "instant", durationAmount: "1", durationUnit: "minute", concentration: false, ritual: false,
    description: "", higher: "",
  },
  feat: { hbId: "", name: "", category: "G", prerequisite: "", repeatable: false, description: "" },
  language: { hbId: "", name: "", type: "standard", typicalSpeakers: "", script: "" },
};

// The fields each kind's form writes; anything else on an entry (e.g. from an import) is kept.
const MANAGED = {
  item: ["name", "source", "hbId", "type", "rarity", "weight", "value", "reqAttune", "weaponCategory", "dmg1", "dmgType", "ac", "entries"],
  spell: ["name", "source", "hbId", "level", "school", "time", "range", "components", "duration", "entries", "entriesHigherLevel"],
  feat: ["name", "source", "hbId", "category", "prerequisite", "repeatable", "entries"],
  language: ["name", "source", "hbId", "type", "typicalSpeakers", "script"],
};

export const newForm = (kind) => ({ ...FORMS[kind] });

const paragraphs = (text) => (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const num = (value) => (String(value ?? "").trim() === "" ? undefined : Number(value));
const str = (value) => (value == null ? "" : String(value));

const ENTRY = {
  item: (f) => {
    const weapon = WEAPON_TYPES.includes(f.type);
    const value = num(f.valueGp);
    return {
      type: f.type,
      rarity: f.rarity,
      weight: num(f.weight),
      value: value === undefined ? undefined : Math.round(value * 100),
      reqAttune: f.attunement || undefined,
      weaponCategory: weapon ? f.weaponCategory || undefined : undefined,
      dmg1: weapon ? f.dmg1 || undefined : undefined,
      dmgType: weapon ? f.dmgType || undefined : undefined,
      ac: ARMOR_TYPES.includes(f.type) ? num(f.ac) : undefined,
      entries: paragraphs(f.description),
    };
  },
  spell: (f) => {
    const distance = f.rangeKind === "feet" ? { type: "feet", amount: num(f.rangeFeet) ?? 0 } : { type: f.rangeKind };
    const duration = f.durationKind === "timed"
      ? { type: "timed", duration: { type: f.durationUnit, amount: num(f.durationAmount) ?? 1 } }
      : f.durationKind === "permanent" ? { type: "permanent", ends: ["dispel"] } : { type: "instant" };
    if (f.concentration) duration.concentration = true;
    const components = {};
    if (f.v) components.v = true;
    if (f.s) components.s = true;
    if (f.m) components.m = f.material.trim() || true;
    return {
      level: num(f.level) ?? 0,
      school: f.school,
      time: [{ number: num(f.timeAmount) ?? 1, unit: f.timeUnit }],
      range: { type: "point", distance },
      components,
      duration: [duration],
      entries: paragraphs(f.description),
      entriesHigherLevel: f.higher.trim()
        ? [{ type: "entries", name: "At Higher Levels", entries: paragraphs(f.higher) }]
        : undefined,
    };
  },
  feat: (f) => ({
    category: f.category || undefined,
    prerequisite: f.prerequisite.trim() ? [{ other: f.prerequisite.trim() }] : undefined,
    repeatable: f.repeatable || undefined,
    entries: paragraphs(f.description),
  }),
  language: (f) => ({
    type: f.type,
    typicalSpeakers: f.typicalSpeakers.split(",").map((s) => s.trim()).filter(Boolean),
    script: f.script.trim() || undefined,
  }),
};

/** The data entry for a form. `original` (when editing) keeps the fields the form doesn't show. */
export const toEntry = (kind, form, original = {}) => {
  const entry = Object.fromEntries(Object.entries(original).filter(([k]) => !MANAGED[kind].includes(k)));
  entry.name = form.name.trim();
  entry.source = HOMEBREW_SOURCE;
  entry.hbId = form.hbId || original.hbId || mkId();
  for (const [key, value] of Object.entries(ENTRY[kind](form))) {
    if (value !== undefined && !(Array.isArray(value) && value.length === 0 && key === "typicalSpeakers")) entry[key] = value;
  }
  if (kind === "spell") {
    const meta = { ...(original.meta ?? {}) };
    if (form.ritual) meta.ritual = true; else delete meta.ritual;
    if (Object.keys(meta).length) entry.meta = meta; else delete entry.meta;
  }
  return entry;
};

const FORM = {
  item: (e) => ({
    type: e.type?.split("|")[0] ?? "G",
    rarity: e.rarity ?? "none",
    weight: str(e.weight),
    valueGp: e.value ? str(e.value / 100) : "",
    attunement: !!e.reqAttune,
    weaponCategory: e.weaponCategory ?? "",
    dmg1: e.dmg1 ?? "",
    dmgType: e.dmgType ?? "",
    ac: str(e.ac),
    description: entriesToText(e.entries),
  }),
  spell: (e) => {
    const distance = e.range?.distance ?? {};
    const rangeKind = ["self", "touch", "sight", "unlimited"].includes(distance.type) ? distance.type : "feet";
    const d = e.duration?.[0] ?? {};
    const m = e.components?.m;
    return {
      level: str(e.level ?? 0),
      school: e.school ?? "V",
      timeAmount: str(e.time?.[0]?.number ?? 1),
      timeUnit: e.time?.[0]?.unit ?? "action",
      rangeKind,
      rangeFeet: rangeKind === "feet" && distance.amount != null ? str(distance.amount) : FORMS.spell.rangeFeet,
      v: !!e.components?.v,
      s: !!e.components?.s,
      m: !!m,
      material: typeof m === "string" ? m : (m?.text ?? ""),
      durationKind: ["timed", "permanent"].includes(d.type) ? d.type : "instant",
      durationAmount: d.type === "timed" ? str(d.duration?.amount ?? 1) : FORMS.spell.durationAmount,
      durationUnit: d.type === "timed" ? (d.duration?.type ?? "minute") : FORMS.spell.durationUnit,
      concentration: !!d.concentration,
      ritual: !!e.meta?.ritual,
      description: entriesToText(e.entries),
      higher: entriesToText(e.entriesHigherLevel?.[0]?.entries ?? []),
    };
  },
  feat: (e) => ({
    category: e.category ?? "",
    prerequisite: prerequisiteText(e.prerequisite),
    repeatable: !!e.repeatable,
    description: entriesToText(e.entries),
  }),
  language: (e) => ({
    type: e.type ?? "standard",
    typicalSpeakers: (e.typicalSpeakers ?? []).join(", "),
    script: e.script ?? "",
  }),
};

/** The form for an existing entry (to edit it). */
export const toForm = (kind, entry) => ({ ...newForm(kind), ...FORM[kind](entry), hbId: entry.hbId ?? "", name: entry.name ?? "" });

const notANumber = (value) => {
  if (String(value ?? "").trim() === "") return false;
  const n = Number(value);
  return !Number.isFinite(n) || n < 0;
};

/** Problems with a form, by field ({} when it can be saved). */
export const validate = (kind, form) => {
  const errors = {};
  if (!form.name?.trim()) errors.name = "Name is required.";
  const numbers = {
    item: ["weight", "valueGp", "ac"],
    spell: ["timeAmount", ...(form.rangeKind === "feet" ? ["rangeFeet"] : []), ...(form.durationKind === "timed" ? ["durationAmount"] : [])],
  }[kind] ?? [];
  for (const field of numbers) if (notANumber(form[field])) errors[field] = "Must be a number of 0 or more.";
  if (kind === "spell") {
    const level = Number(form.level);
    if (!Number.isInteger(level) || level < 0 || level > 9) errors.level = "Level is 0 (cantrip) to 9.";
  }
  return errors;
};

export const upsertEntry = (list, entry) =>
  list.some((e) => e.hbId === entry.hbId) ? list.map((e) => (e.hbId === entry.hbId ? entry : e)) : [...list, entry];

export const removeEntry = (list, hbId) => list.filter((e) => e.hbId !== hbId);

/** All homebrew as one file in the addon's data format: usable as a source for every list, or imported elsewhere. */
export const exportFile = (lists) =>
  JSON.stringify({
    _meta: { sources: [{ json: HOMEBREW_SOURCE, full: HOMEBREW_SOURCE }] },
    ...Object.fromEntries(KINDS.map(({ listKey }) => [listKey, lists[listKey] ?? []])),
  }, null, 2);

/**
 * Adds a data file's items/spells/feats/languages to the homebrew. An entry with the
 * same name as one already there replaces it (keeping its id). Throws on a file that
 * isn't in the addon's data format.
 */
export const importFile = (text, current) => {
  let file;
  try {
    file = JSON.parse(text);
  } catch {
    throw new Error("This is not valid JSON.");
  }
  if (!KINDS.some(({ listKey }) => Array.isArray(file?.[listKey]))) {
    throw new Error("The file has no item, spell, feat or language list.");
  }

  let added = 0;
  let replaced = 0;
  const lists = {};
  for (const { listKey } of KINDS) {
    let list = [...(current[listKey] ?? [])];
    for (const raw of Array.isArray(file[listKey]) ? file[listKey] : []) {
      if (!raw || typeof raw.name !== "string") continue;
      // eslint-disable-next-line no-unused-vars
      const { srdEditions, ...rest } = raw;
      const same = list.find((e) => e.name.toLowerCase() === raw.name.toLowerCase());
      const entry = { ...rest, source: HOMEBREW_SOURCE, hbId: same?.hbId ?? raw.hbId ?? mkId() };
      if (same) replaced++; else added++;
      list = upsertEntry(list, entry); // same name: same hbId, so it replaces
    }
    lists[listKey] = list;
  }
  return { lists, added, replaced };
};
