// A monster entry (data/srd-5.x/monsters.json, or homebrew made in 5E Homebrew) turned
// into the monster card's properties. Shared by the monster creator and the homebrew
// editor, so a homebrew monster and an SRD one land on the card the same way.
import { mkId } from "../../dnd5e-nordvikcard/src/srdHelpers.js";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_NAME = {
  str: "Strength", dex: "Dexterity", con: "Constitution", int: "Intelligence", wis: "Wisdom", cha: "Charisma",
};
const ABILITY_PROP = {
  str: "strength", dex: "dexterity", con: "constitution", int: "intelligence", wis: "wisdom", cha: "charisma",
};
export const SIZE_NAME = { T: "Tiny", S: "Small", M: "Medium", L: "Large", H: "Huge", G: "Gargantuan" };

// ── Markup ────────────────────────────────────────────────────────────────────

const ATTACK = {
  mw: "Melee Weapon Attack:", rw: "Ranged Weapon Attack:", "mw,rw": "Melee or Ranged Weapon Attack:",
  ms: "Melee Spell Attack:", rs: "Ranged Spell Attack:", "ms,rs": "Melee or Ranged Spell Attack:",
};
const ATTACK_ROLL = { m: "Melee Attack Roll:", r: "Ranged Attack Roll:", "m,r": "Melee or Ranged Attack Roll:" };
const FIRST_PART = new Set(["b", "bold", "i", "italic", "u", "s", "strike", "note", "sup", "sub", "dice", "damage", "d20", "scaledice", "scaledamage", "book", "filter", "link"]);

const renderTag = (tag, arg) => {
  const parts = (arg ?? "").split("|");
  switch (tag) {
    case "atk": return ATTACK[arg] ?? "Attack:";
    case "atkr": return ATTACK_ROLL[arg] ?? "Attack Roll:";
    case "hit": return /^-/.test(arg) ? arg : `+${arg}`;
    case "h": return "Hit: ";
    case "m": return "Miss: ";
    case "hom": return "Hit or Miss: ";
    case "dc": return `DC ${parts[0]}`;
    case "actSave": return `${ABILITY_NAME[arg] ?? arg} Saving Throw:`;
    case "actSaveFail": return arg ? `Failure by ${arg} or More:` : "Failure:";
    case "actSaveFailBy": return `Failure by ${arg} or More:`;
    case "actSaveSuccess": return "Success:";
    case "actSaveSuccessOrFail": return "Failure or Success:";
    case "actTrigger": return "Trigger:";
    case "actResponse": return "Response:";
    case "recharge": return arg ? `(Recharge ${arg}–6)` : "(Recharge 6)";
    case "chance": return parts[1] || `${parts[0]} percent`;
    case "hitYourSpellAttack": return arg || "your spell attack modifier";
    default:
      if (arg === undefined) return "";
      return FIRST_PART.has(tag) ? parts[0] : (parts[2] || parts[0]);
  }
};

/** Stat block text from the data's markup ({@atk mw} → "Melee Weapon Attack:", {@h} → "Hit: ", ...). */
export const renderTags = (text) => {
  let out = String(text ?? "");
  for (let previous = null; previous !== out;) {
    previous = out;
    out = out.replace(/\{@(\w+)(?: ([^{}]*))?\}/g, (_, tag, arg) => renderTag(tag, arg));
  }
  return out.replace(/ {2,}/g, " ").trim();
};

/** Plain text of an `entries` list: nested sections, lists and their items. */
export const entriesText = (entries) =>
  (Array.isArray(entries) ? entries : [])
    .map((e) => {
      if (typeof e === "string") return renderTags(e);
      if (!e || typeof e !== "object") return "";
      if (e.type === "list") return entriesText(e.items).split("\n").map((line) => (line ? `• ${line}` : line)).join("\n");
      const inner = e.entries ? entriesText(e.entries) : e.entry ? renderTags(e.entry) : "";
      return e.name ? `${renderTags(e.name)}. ${inner}` : inner;
    })
    .filter(Boolean)
    .join("\n");

// ── Stat block fields ─────────────────────────────────────────────────────────

// The card's alignment words and their codes (alignmentText reads the codes back).
const ALIGNMENT_CODES = {
  "unaligned": ["U"], "lawful good": ["L", "G"], "neutral good": ["N", "G"], "chaotic good": ["C", "G"],
  "lawful neutral": ["L", "N"], "neutral": ["N"], "chaotic neutral": ["C", "N"],
  "lawful evil": ["L", "E"], "neutral evil": ["N", "E"], "chaotic evil": ["C", "E"],
  "any alignment": ["A"], "any non-good": ["L", "NX", "C", "NY", "E"], "any non-lawful": ["NX", "C", "G", "NY", "E"],
  "any chaotic": ["C", "G", "NY", "E"], "any evil": ["L", "NX", "C", "E"], "any good": ["L", "NX", "C", "G"],
  "any non-evil": ["L", "NX", "C", "NY", "G"], "any lawful": ["L", "G", "NY", "E"],
};
export const ALIGNMENTS = Object.keys(ALIGNMENT_CODES);
export const alignmentCodes = (text) => ALIGNMENT_CODES[text] ?? ["A"];

export const MONSTER_TYPES = [
  "aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend",
  "giant", "humanoid", "monstrosity", "ooze", "plant", "undead",
];

const ANY_ALIGNMENT = {
  "C,E,L,NX,NY": "any non-good", "C,E,G,NX,NY": "any non-lawful", "C,E,G,NY": "any chaotic",
  "C,E,L,NX": "any evil", "C,G,L,NX": "any good", "C,G,L,NX,NY": "any non-evil", "E,G,L,NY": "any lawful",
};
const LAW = { L: "lawful", N: "neutral", NX: "neutral", C: "chaotic" };
const MORAL = { G: "good", E: "evil", N: "neutral", NY: "neutral" };

/** Alignment codes as the card's words ("chaotic neutral", "any non-good", ...). */
export const alignmentText = (alignment) => {
  const list = Array.isArray(alignment) ? alignment : [];
  if (list.some((a) => a && typeof a === "object")) {
    return list
      .map((a) => (typeof a === "object" ? `${alignmentText(a.alignment)}${a.chance ? ` (${a.chance}%)` : ""}` : alignmentText([a])))
      .join(" or ");
  }
  if (list.length === 1) return { U: "unaligned", A: "any alignment", N: "neutral" }[list[0]] ?? LAW[list[0]] ?? MORAL[list[0]] ?? list[0];
  const known = ANY_ALIGNMENT[[...list].sort().join(",")];
  if (known) return known;
  if (list.length === 2) {
    const law = LAW[list[0]];
    const moral = MORAL[list[1]];
    if (law && moral) return law === "neutral" && moral === "neutral" ? "neutral" : `${law} ${moral}`;
  }
  return list.map((a) => LAW[a] ?? MORAL[a] ?? a).join(" ");
};

/** Damage/condition lists, where a group with a note is an object ({ immune: [...], note }). */
export const damageListText = (list, key) => {
  const segments = [];
  let plain = [];
  for (const item of Array.isArray(list) ? list : []) {
    if (typeof item === "string") { plain.push(renderTags(item)); continue; }
    if (plain.length) { segments.push(plain.join(", ")); plain = []; }
    if (item?.special) { segments.push(renderTags(item.special)); continue; }
    const inner = damageListText(item?.[key], key);
    segments.push([item?.preNote, inner, item?.note].filter(Boolean).map(renderTags).join(" "));
  }
  if (plain.length) segments.push(plain.join(", "));
  return segments.filter(Boolean).join("; ");
};

const speedText = (speed) => {
  if (!speed || typeof speed !== "object") return "";
  const one = (v) => (typeof v === "object" ? `${v.number} ft.${v.condition ? ` ${renderTags(v.condition)}` : ""}` : `${v} ft.`);
  return ["walk", "burrow", "climb", "fly", "swim"]
    .filter((k) => speed[k] != null && speed[k] !== true)
    .map((k) => `${k === "walk" ? "" : `${k} `}${one(speed[k])}${k === "fly" && speed.canHover ? " (hover)" : ""}`)
    .join(", ");
};

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const signed = (n) => (n >= 0 ? `+${n}` : String(n));

const typeOf = (type) => {
  if (typeof type === "string") return { type, subtype: "" };
  const base = typeof type?.type === "string" ? type.type : (type?.type?.choose ?? []).join(" or ");
  const tags = (type?.tags ?? []).map((t) => (typeof t === "string" ? t : [t.prefix, t.tag].filter(Boolean).join(" ")));
  if (type?.swarmSize) tags.unshift(`swarm of ${SIZE_NAME[type.swarmSize] ?? type.swarmSize} creatures`);
  return { type: base ?? "", subtype: tags.join(", ") };
};

// ── Spellcasting ──────────────────────────────────────────────────────────────

const ordinal = (n) => `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n] ?? "th"}`;
const spellList = (spells) => (spells ?? []).map(renderTags).join(", ");

const FREQUENCY = { daily: "day", rest: "rest", weekly: "week", monthly: "month", yearly: "year" };

export const spellcastingText = (sc) => {
  const lines = [entriesText(sc.headerEntries)];
  if (sc.will) lines.push(`At will: ${spellList(sc.will)}`);
  for (const [key, per] of Object.entries(FREQUENCY)) {
    for (const [times, spells] of Object.entries(sc[key] ?? {})) {
      lines.push(`${times.replace("e", "")}/${per}${times.endsWith("e") ? " each" : ""}: ${spellList(spells)}`);
    }
  }
  for (const [level, { slots, spells }] of Object.entries(sc.spells ?? {})) {
    lines.push(level === "0"
      ? `Cantrips (at will): ${spellList(spells)}`
      : `${ordinal(level)} level${slots ? ` (${slots} slots)` : ""}: ${spellList(spells)}`);
  }
  lines.push(entriesText(sc.footerEntries));
  return lines.filter(Boolean).join("\n");
};

// ── Actions ───────────────────────────────────────────────────────────────────

const ABILITY_BY_NAME = Object.fromEntries(Object.entries(ABILITY_NAME).map(([k, v]) => [v.toLowerCase(), k]));

const EMPTY_ACTION = {
  name: "", type: "other", recharge: "", attackBonus: "", damage: "", damageType: "",
  reach: "", range: "", saveDc: "", saveAbility: "", description: "",
};

/** One action of the data as the card's action fields (attack, save or other). */
export const parseAction = (entry) => {
  const rawName = String(entry?.name ?? "");
  const recharge = rawName.match(/\{@recharge(?: (\d))?\}/);
  const raw = (entry?.entries ?? []).filter((e) => typeof e === "string").join(" ");
  const action = {
    ...EMPTY_ACTION,
    id: mkId(),
    name: renderTags(rawName.replace(/\{@recharge(?: \d)?\}/, "")),
    recharge: recharge ? `${recharge[1] ?? 6}–6` : "",
    description: entriesText(entry?.entries),
  };

  const damage = raw.match(/\{@damage ([^}]+)\}\)?\s*([A-Za-z]+) damage/) ?? raw.match(/\{@damage ([^}]+)\}/);
  const withDamage = () => {
    action.damage = damage?.[1] ?? "";
    action.damageType = damage?.[2] ? titleCase(damage[2].toLowerCase()) : "";
  };

  if (/\{@atkr? [^}]*\}/.test(raw)) {
    action.type = "attack";
    const hit = raw.match(/\{@hit (-?\d+)\}/);
    action.attackBonus = hit ? signed(Number(hit[1])) : "";
    action.reach = raw.match(/reach (\d+) ft\./)?.[1] ? `${raw.match(/reach (\d+) ft\./)[1]} ft.` : "";
    action.range = raw.match(/range (\d+(?:\/\d+)?) ft\./)?.[1] ? `${raw.match(/range (\d+(?:\/\d+)?) ft\./)[1]} ft.` : "";
    withDamage();
    return action;
  }

  const actSave = raw.match(/\{@actSave (\w+)\}/);
  const oldSave = raw.match(/\{@dc (\d+)\}[^.]*?\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) saving throw/i);
  if (actSave || oldSave) {
    action.type = "save";
    action.saveDc = (raw.match(/\{@dc (\d+)\}/) ?? [])[1] ?? "";
    action.saveAbility = (actSave ? actSave[1] : ABILITY_BY_NAME[oldSave[2].toLowerCase()]).toUpperCase();
    action.range = raw.match(/range (\d+(?:\/\d+)?) ft\./)?.[1] ? `${raw.match(/range (\d+(?:\/\d+)?) ft\./)[1]} ft.` : "";
    withDamage();
  }
  return action;
};

/** The data entry for an action typed into the card's fields (5E Homebrew); parseAction reads it back. */
export const actionEntry = (fields) => {
  const rechargeDigit = (fields.recharge ?? "").match(/\d/)?.[0];
  const name = `${fields.name}${rechargeDigit ? ` {@recharge ${rechargeDigit}}` : ""}`;
  const damage = fields.damage
    ? `({@damage ${fields.damage}}) ${(fields.damageType || "").toLowerCase()} damage.`.replace(/\) {2}/, ") ")
    : "";
  const bonus = String(fields.attackBonus ?? "").replace(/^\+/, "") || "0";
  let text = "";
  if (fields.type === "attack") {
    const where = [fields.reach && `reach ${fields.reach}`, fields.range && `range ${fields.range}`].filter(Boolean).join(" or ");
    const kind = fields.range && !fields.reach ? "rw" : fields.range ? "mw,rw" : "mw";
    text = `{@atk ${kind}} {@hit ${bonus}} to hit${where ? `, ${where}` : ""}, one target. {@h}${damage}`.trim();
  } else if (fields.type === "save") {
    const ability = (fields.saveAbility || "dex").toLowerCase();
    text = `{@actSave ${ability}} {@dc ${fields.saveDc || 10}}${fields.range ? `, range ${fields.range}` : ""}.${damage ? ` {@actSaveFail} ${damage}` : ""}`;
  }
  const entries = [text, fields.description?.trim()].filter(Boolean);
  return { name, entries: entries.length ? entries : [""] };
};

// ── The card ──────────────────────────────────────────────────────────────────

// The card's list storage (its usePropertyList hook): <name>_count, <name>_<i> (JSON), <name>_notify.
const listProps = (name, items) => [
  { name: `${name}_count`, value: String(items.length) },
  ...items.map((item, i) => ({ name: `${name}_${i}`, value: JSON.stringify(item) })),
  { name: `${name}_notify`, value: String(Date.now()) },
];

const SUFFIX = { bonus: " (Bonus Action)", reaction: " (Reaction)", legendary: " (Legendary)" };

/** Every monster card property for an entry, as [{ name, value }] with string values. */
export const monsterToProps = (m) => {
  const { type, subtype } = typeOf(m.type);
  const ac = Array.isArray(m.ac) ? m.ac[0] : m.ac;
  const hp = m.hp?.average ?? m.hp?.special ?? "";
  const props = {
    monster_name: m.name,
    monster_size: SIZE_NAME[Array.isArray(m.size) ? m.size[0] : m.size] ?? "",
    monster_type: type,
    monster_subtype: subtype,
    monster_alignment: alignmentText(m.alignment),
    cr: typeof m.cr === "object" ? (m.cr?.cr ?? "") : (m.cr ?? ""),
    armor: typeof ac === "object" ? (ac?.ac ?? ac?.special ?? "") : (ac ?? ""),
    hp,
    maxhp: hp,
    speed: speedText(m.speed),
    saving_throws: Object.entries(m.save ?? {}).filter(([, v]) => typeof v === "string").map(([k, v]) => `${k.toUpperCase()} ${v}`).join(", "),
    skills_text: Object.entries(m.skill ?? {}).filter(([, v]) => typeof v === "string").map(([k, v]) => `${titleCase(k)} ${v}`).join(", "),
    senses: [...(m.senses ?? []).map(renderTags), ...(m.passive != null ? [`passive Perception ${m.passive}`] : [])].join(", "),
    languages: (m.languages ?? []).map(renderTags).join(", "),
    immunities: damageListText(m.immune, "immune"),
    resistances: damageListText(m.resist, "resist"),
    vulnerabilities: damageListText(m.vulnerable, "vulnerable"),
    condition_immunities: damageListText(m.conditionImmune, "conditionImmune"),
  };
  for (const ability of ABILITIES) {
    const score = Number(m[ability] ?? 10);
    props[`${ABILITY_PROP[ability]}_attribute`] = score;
    props[`${ABILITY_PROP[ability]}_mod`] = Math.floor((score - 10) / 2);
  }

  const casting = (m.spellcasting ?? []).map((sc) => ({ sc, as: sc.displayAs ?? "trait" }));
  const castingEntry = (sc, suffix = "") => ({
    ...EMPTY_ACTION, id: mkId(), name: `${renderTags(sc.name ?? "Spellcasting")}${suffix}`, description: spellcastingText(sc),
  });

  const traits = [
    ...(m.trait ?? []).map((t) => ({ id: mkId(), name: renderTags(t.name), description: entriesText(t.entries) })),
    ...casting.filter(({ as }) => as === "trait").map(({ sc }) => ({ id: mkId(), name: renderTags(sc.name ?? "Spellcasting"), description: spellcastingText(sc) })),
  ];
  const actions = [
    ...(m.action ?? []).map(parseAction),
    ...casting.filter(({ as }) => as === "action").map(({ sc }) => castingEntry(sc)),
    ...["bonus", "reaction", "legendary"].flatMap((kind) => [
      ...(m[kind] ?? []).map((a) => { const action = parseAction(a); return { ...action, name: `${action.name}${SUFFIX[kind]}` }; }),
      ...casting.filter(({ as }) => as === kind).map(({ sc }) => castingEntry(sc, SUFFIX[kind])),
    ]),
  ];

  return [
    ...Object.entries(props).map(([name, value]) => ({ name, value: String(value ?? "") })),
    ...listProps("traits", traits),
    ...listProps("actions", actions),
  ];
};
