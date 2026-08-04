// Trimmed copy of dnd5e-nordvikcard's srdHelpers.js — only the item-related
// helpers this tool needs (no spell helpers).

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
