// Helpers for turning 5etools-shaped SRD entries into card data.
// dnd5e-itemcreator/src/srdHelpers.js is a trimmed copy of the item half of this file.

export const DMGTYPE_LABEL = {
  B: "Bludgeoning", P: "Piercing", S: "Slashing",
  F: "Fire", C: "Cold", L: "Lightning", A: "Acid",
  N: "Necrotic", R: "Radiant", T: "Thunder", O: "Poison", Y: "Psychic",
};

export const ITEM_TYPE_LABEL = {
  M: "Melee Weapon", R: "Ranged Weapon",
  A: "Ammunition", HA: "Heavy Armor", MA: "Medium Armor", LA: "Light Armor",
  S: "Shield", G: "Gear", P: "Potion", T: "Tool",
  SCF: "Spellcasting Focus", FD: "Food & Drink", INS: "Instrument",
};

export const stripTags = (str) =>
  str.replace(/\{@\w+ ([^|}]+)(?:\|[^}]*)?\}/g, "$1");

/** Recursively extract plain text from a 5etools entries array. */
export const entriesToText = (entries) => {
  if (!entries || !Array.isArray(entries)) return "";
  const parts = [];
  for (const e of entries) {
    if (typeof e === "string") {
      parts.push(stripTags(e));
    } else if (e && typeof e === "object") {
      const sub = entriesToText(e.entries ?? e.items ?? e.rows ?? []);
      if (sub) parts.push(sub);
    }
  }
  return parts.join("\n\n");
};

export const formatValue = (cp) => {
  if (!cp) return "";
  if (cp >= 100) return `${cp % 100 === 0 ? cp / 100 : (cp / 100).toFixed(1)} gp`;
  if (cp >= 10) return `${Math.floor(cp / 10)} sp`;
  return `${cp} cp`;
};

export const resolveTypeLabel = (type) => {
  if (!type) return "";
  const base = type.split("|")[0];
  return ITEM_TYPE_LABEL[base] ?? base;
};

export const mkId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── Spells ────────────────────────────────────────────────────────────────────

export const SCHOOL_LABEL = {
  A: "Abjuration", C: "Conjuration", D: "Divination", E: "Enchantment",
  I: "Illusion", N: "Necromancy", T: "Transmutation", V: "Evocation",
};

export const formatCastingTime = (time) => {
  if (!Array.isArray(time) || !time.length) return "1 action";
  const t = time[0];
  return `${t.number} ${t.unit}`;
};

export const formatRange = (range) => {
  if (!range) return "—";
  if (range.type === "special") return "Special";
  if (range.type === "sight") return "Sight";
  if (range.type === "unlimited") return "Unlimited";
  const d = range.distance;
  if (!d) return range.type;
  if (d.type === "self") return "Self";
  if (d.type === "touch") return "Touch";
  return `${d.amount} ft.`;
};

export const formatDuration = (duration) => {
  if (!Array.isArray(duration) || !duration.length) return "Instantaneous";
  const d = duration[0];
  if (d.type === "instant") return "Instantaneous";
  if (d.type === "permanent") return "Until dispelled";
  if (d.type === "special") return "Special";
  if (d.type === "timed" && d.duration) {
    const base = `${d.duration.amount} ${d.duration.type}`;
    return d.concentration ? `${base} (C)` : base;
  }
  return "Instantaneous";
};

export const formatComponents = (components) => {
  if (!components) return "";
  const parts = [];
  if (components.v) parts.push("V");
  if (components.s) parts.push("S");
  if (components.m) parts.push(typeof components.m === "string" ? `M (${components.m})` : `M (${components.m.text})`);
  return parts.join(", ");
};

/** Converts an SRD spell entry into the shape stored in the card's `spells` list. */
export const spellFromSrd = (spell) => ({
  id: mkId(),
  name: spell.name,
  source: spell.source ?? "",
  level: String(spell.level ?? 0),
  school: spell.school ?? "V",
  castingTime: formatCastingTime(spell.time),
  range: formatRange(spell.range),
  duration: formatDuration(spell.duration),
  components: formatComponents(spell.components),
  concentration: !!spell.duration?.[0]?.concentration,
  ritual: !!spell.meta?.ritual,
  prepared: false,
  action: "",
  actionArgs: "",
  description: entriesToText(spell.entries ?? []),
  descHigher: entriesToText(spell.entriesHigherLevel?.[0]?.entries ?? []),
});
