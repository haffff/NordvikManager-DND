// Feats on the character sheet: entries from the synced feat sources (the addon's
// data format, see data/srd-5.x/feats.json) turned into what the sheet stores.
import { entriesToText, mkId } from "./srdHelpers.js";

const ABILITY_NAME = {
  str: "Strength", dex: "Dexterity", con: "Constitution",
  int: "Intelligence", wis: "Wisdom", cha: "Charisma",
};

const CATEGORY_LABEL = { G: "General", O: "Origin", FS: "Fighting Style", EB: "Epic Boon" };

export const categoryLabel = (category) => CATEGORY_LABEL[category] ?? category ?? "";

// One alternative of a prerequisite: { level, ability, feature, spellcasting..., other }.
const prerequisitePart = (p) => {
  const parts = [];
  if (p.level != null) parts.push(`Level ${typeof p.level === "object" ? p.level.level : p.level}+`);
  if (Array.isArray(p.ability)) {
    parts.push(p.ability
      .map((a) => Object.entries(a).map(([k, v]) => `${ABILITY_NAME[k] ?? k} ${v}+`).join(", "))
      .join(" or "));
  }
  if (Array.isArray(p.feature)) parts.push(...p.feature.map((f) => `${f} feature`));
  if (p.spellcasting || p.spellcasting2020) parts.push("Spellcasting or Pact Magic feature");
  if (typeof p.other === "string") parts.push(p.other);
  return parts.join(", ");
};

/** A feat's `prerequisite` (a list of alternatives) as one line of text. */
export const prerequisiteText = (prerequisite) =>
  Array.isArray(prerequisite) ? prerequisite.map(prerequisitePart).filter(Boolean).join(" or ") : "";

const sourceLabel = (entry) =>
  entry.srdEditions?.length ? `SRD ${entry.srdEditions.join("/")}` : (entry.source ?? "");

/** What the sheet stores for a feat picked from the data: its text is kept with it. */
export const featFromSrd = (entry) => ({
  id: mkId(),
  name: entry.name,
  source: sourceLabel(entry),
  category: categoryLabel(entry.category),
  prerequisite: prerequisiteText(entry.prerequisite),
  description: entriesToText(entry.entries),
  notes: "",
});

export const customFeat = (name) => ({
  id: mkId(), name, source: "Custom", category: "", prerequisite: "", description: "", notes: "",
});

/**
 * The picker's list: names containing `query`, of the given SRD edition ("" = all).
 * Feats from other sources have no edition and are always listed.
 */
export const searchFeats = (feats, query, edition = "") => {
  const q = query.trim().toLowerCase();
  return feats
    .filter((f) => !q || f.name.toLowerCase().includes(q))
    .filter((f) => !edition || !f.srdEditions || f.srdEditions.includes(edition))
    .sort((a, b) => a.name.localeCompare(b.name));
};
