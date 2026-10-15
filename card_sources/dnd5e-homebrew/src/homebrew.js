// The game's homebrew: items, spells, feats and languages made in the 5E Homebrew view.
// Each kind is one game resource in the addon's data format ({ item: [...] }, ...) under the key
// a source named "Homebrew" would have, so the sheets read it next to their sources
// (dnd5e-nordvikcard/src/sourceKeys.js). Forms hold only what the cards show; the
// sheet's own readers (srdHelpers.js, feats.js) are reused so the two can't drift.
import { entriesToText, mkId } from "../../dnd5e-nordvikcard/src/srdHelpers.js";
import { prerequisiteText } from "../../dnd5e-nordvikcard/src/feats.js";
import {
  actionEntry, parseAction, alignmentText, alignmentCodes, ALIGNMENTS, renderTags, entriesText, damageListText,
} from "../../dnd5e-monstercard/src/monsterData.js";

export const HOMEBREW_SOURCE = "Homebrew";

export const KINDS = [
  { kind: "item", label: "Items", listKey: "item", resourceKey: "dnd5e_items_homebrew" },
  { kind: "spell", label: "Spells", listKey: "spell", resourceKey: "dnd5e_spells_homebrew" },
  { kind: "feat", label: "Feats", listKey: "feat", resourceKey: "dnd5e_feats_homebrew" },
  { kind: "language", label: "Languages", listKey: "language", resourceKey: "dnd5e_languages_homebrew" },
  { kind: "monster", label: "Monsters", listKey: "monster", resourceKey: "dnd5e_bestiary_homebrew" },
];

export const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
export const SPEEDS = ["walk", "burrow", "climb", "fly", "swim"];
export const ACTION_KINDS = { action: "Action", bonus: "Bonus Action", reaction: "Reaction", legendary: "Legendary" };

export const newAction = () => ({
  kind: "action", name: "", type: "attack", recharge: "", attackBonus: "+0", damage: "", damageType: "",
  reach: "5 ft.", range: "", saveDc: "", saveAbility: "", description: "",
});

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
  monster: {
    hbId: "", name: "", size: "M", type: "humanoid", subtype: "", alignment: "unaligned", cr: "1",
    ac: "10", hp: "10", hpFormula: "", walk: "30", burrow: "", climb: "", fly: "", swim: "",
    str: "10", dex: "10", con: "10", int: "10", wis: "10", cha: "10",
    save_str: "", save_dex: "", save_con: "", save_int: "", save_wis: "", save_cha: "",
    skills: "", senses: "", passive: "10", languages: "",
    immune: "", resist: "", vulnerable: "", conditionImmune: "",
    traits: [], actions: [],
  },
};

// The fields each kind's form writes; anything else on an entry (e.g. from an import) is kept.
const MANAGED = {
  item: ["name", "source", "hbId", "type", "rarity", "weight", "value", "reqAttune", "weaponCategory", "dmg1", "dmgType", "ac", "entries"],
  spell: ["name", "source", "hbId", "level", "school", "time", "range", "components", "duration", "entries", "entriesHigherLevel"],
  feat: ["name", "source", "hbId", "category", "prerequisite", "repeatable", "entries"],
  language: ["name", "source", "hbId", "type", "typicalSpeakers", "script"],
  monster: [
    "name", "source", "hbId", "size", "type", "alignment", "cr", "ac", "hp", "speed",
    "str", "dex", "con", "int", "wis", "cha", "save", "skill", "senses", "passive", "languages",
    "immune", "resist", "vulnerable", "conditionImmune", "trait", "action", "bonus", "reaction", "legendary",
  ],
};

// Fresh lists each time, so two new monster forms never share their traits/actions arrays.
// `hidden` (every kind): kept out of players' lists; the GM still sees it.
export const newForm = (kind) => ({ ...FORMS[kind], hidden: false, ...(kind === "monster" ? { traits: [], actions: [] } : {}) });

const paragraphs = (text) => (text ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const num = (value) => (String(value ?? "").trim() === "" ? undefined : Number(value));
const str = (value) => (value == null ? "" : String(value));
const commaList = (text) => (text ?? "").split(",").map((s) => s.trim()).filter(Boolean);
const signedText = (text) => {
  const t = String(text ?? "").trim();
  return !t ? "" : /^[+-]/.test(t) ? t : `+${t}`;
};
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

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
  monster: (f) => {
    const subtype = commaList(f.subtype);
    const hp = { average: num(f.hp) ?? 1 };
    if (f.hpFormula.trim()) hp.formula = f.hpFormula.trim();
    const speed = Object.fromEntries(SPEEDS.filter((k) => num(f[k]) !== undefined).map((k) => [k, num(f[k])]));
    const save = Object.fromEntries(ABILITIES.filter((a) => f[`save_${a}`]?.trim()).map((a) => [a, signedText(f[`save_${a}`])]));
    const skill = Object.fromEntries(commaList(f.skills)
      .map((s) => s.match(/^(.+?)\s*([+-]?\d+)$/))
      .filter(Boolean)
      .map(([, name, bonus]) => [name.toLowerCase(), signedText(bonus)]));
    const byKind = (kind) => f.actions.filter((a) => (a.kind ?? "action") === kind && a.name.trim()).map(actionEntry);
    return {
      size: [f.size],
      type: subtype.length ? { type: f.type, tags: subtype } : f.type,
      alignment: alignmentCodes(f.alignment),
      cr: f.cr.trim() || undefined,
      ac: [num(f.ac) ?? 10],
      hp,
      speed,
      ...Object.fromEntries(ABILITIES.map((a) => [a, num(f[a]) ?? 10])),
      save: Object.keys(save).length ? save : undefined,
      skill: Object.keys(skill).length ? skill : undefined,
      senses: commaList(f.senses),
      passive: num(f.passive),
      languages: commaList(f.languages),
      immune: commaList(f.immune),
      resist: commaList(f.resist),
      vulnerable: commaList(f.vulnerable),
      conditionImmune: commaList(f.conditionImmune),
      trait: f.traits.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim(), entries: paragraphs(t.description) })),
      action: byKind("action"),
      bonus: byKind("bonus"),
      reaction: byKind("reaction"),
      legendary: byKind("legendary"),
    };
  },
};

// Lists left out of an entry when empty.
const OMIT_EMPTY = new Set([
  "typicalSpeakers", "senses", "languages", "immune", "resist", "vulnerable", "conditionImmune",
  "trait", "action", "bonus", "reaction", "legendary",
]);

/** The data entry for a form. `original` (when editing) keeps the fields the form doesn't show. */
export const toEntry = (kind, form, original = {}) => {
  const entry = Object.fromEntries(Object.entries(original).filter(([k]) => !MANAGED[kind].includes(k) && k !== "hidden"));
  entry.name = form.name.trim();
  entry.source = HOMEBREW_SOURCE;
  entry.hbId = form.hbId || original.hbId || mkId();
  for (const [key, value] of Object.entries(ENTRY[kind](form))) {
    if (value !== undefined && !(Array.isArray(value) && value.length === 0 && OMIT_EMPTY.has(key))) entry[key] = value;
  }
  if (kind === "spell") {
    const meta = { ...(original.meta ?? {}) };
    if (form.ritual) meta.ritual = true; else delete meta.ritual;
    if (Object.keys(meta).length) entry.meta = meta; else delete entry.meta;
  }
  if (form.hidden) entry.hidden = true;
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
  monster: (e) => {
    const ac = Array.isArray(e.ac) ? e.ac[0] : e.ac;
    const speed = (k) => {
      const v = e.speed?.[k];
      return v == null || v === true ? "" : str(typeof v === "object" ? v.number : v);
    };
    const alignment = alignmentText(e.alignment);
    const actionRow = (kind) => (a) => {
      // eslint-disable-next-line no-unused-vars
      const { id, ...fields } = parseAction(a);
      return { kind, ...fields };
    };
    return {
      size: (Array.isArray(e.size) ? e.size[0] : e.size) ?? "M",
      type: typeof e.type === "string" ? e.type : (typeof e.type?.type === "string" ? e.type.type : ""),
      subtype: (e.type?.tags ?? []).map((t) => (typeof t === "string" ? t : [t.prefix, t.tag].filter(Boolean).join(" "))).join(", "),
      alignment: ALIGNMENTS.includes(alignment) ? alignment : "any alignment",
      cr: str(typeof e.cr === "object" ? e.cr?.cr : e.cr),
      ac: str(typeof ac === "object" ? ac?.ac : ac),
      hp: str(e.hp?.average),
      hpFormula: e.hp?.formula ?? "",
      ...Object.fromEntries(SPEEDS.map((k) => [k, speed(k)])),
      ...Object.fromEntries(ABILITIES.map((a) => [a, str(e[a] ?? 10)])),
      ...Object.fromEntries(ABILITIES.map((a) => [`save_${a}`, typeof e.save?.[a] === "string" ? e.save[a] : ""])),
      skills: Object.entries(e.skill ?? {}).filter(([, v]) => typeof v === "string").map(([k, v]) => `${titleCase(k)} ${v}`).join(", "),
      senses: (e.senses ?? []).map(renderTags).join(", "),
      passive: str(e.passive),
      languages: (e.languages ?? []).map(renderTags).join(", "),
      immune: damageListText(e.immune, "immune"),
      resist: damageListText(e.resist, "resist"),
      vulnerable: damageListText(e.vulnerable, "vulnerable"),
      conditionImmune: damageListText(e.conditionImmune, "conditionImmune"),
      traits: (e.trait ?? []).map((t) => ({ name: renderTags(t.name), description: entriesText(t.entries) })),
      actions: Object.keys(ACTION_KINDS).flatMap((kind) => (e[kind] ?? []).map(actionRow(kind))),
    };
  },
};

/** The form for an existing entry (to edit it). */
export const toForm = (kind, entry) => ({
  ...newForm(kind), ...FORM[kind](entry), hbId: entry.hbId ?? "", name: entry.name ?? "", hidden: !!entry.hidden,
});

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
    monster: ["ac", "hp", "passive", ...SPEEDS],
    spell: ["timeAmount", ...(form.rangeKind === "feet" ? ["rangeFeet"] : []), ...(form.durationKind === "timed" ? ["durationAmount"] : [])],
  }[kind] ?? [];
  for (const field of numbers) if (notANumber(form[field])) errors[field] = "Must be a number of 0 or more.";
  if (kind === "monster") {
    for (const a of ABILITIES) {
      const score = Number(form[a]);
      if (!Number.isInteger(score) || score < 1 || score > 30) errors[a] = "Ability scores are 1 to 30.";
    }
  }
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
    throw new Error("The file has no item, spell, feat, language or monster list.");
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
