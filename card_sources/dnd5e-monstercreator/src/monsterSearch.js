// The monster creator's list: search and filters over the merged bestiary sources.

export const crOf = (m) => String((typeof m.cr === "object" ? m.cr?.cr : m.cr) ?? "");

/** Sortable value of a challenge rating ("1/4" → 0.25); unknown sorts last. */
export const crValue = (cr) => {
  const [a, b] = String(cr).split("/").map(Number);
  if (Number.isNaN(a)) return Infinity;
  return b ? a / b : a;
};

export const typeName = (m) => (typeof m.type === "string" ? m.type : (typeof m.type?.type === "string" ? m.type.type : "")) || "";

/**
 * Monsters matching { query, type, cr, edition } ("" or missing = any), by challenge rating
 * then name. Monsters without an SRD edition (homebrew, other sources) match every edition.
 */
export const searchMonsters = (monsters, { query = "", type = "", cr = "", edition = "" } = {}) => {
  const q = query.trim().toLowerCase();
  return monsters
    .filter((m) => !q || m.name.toLowerCase().includes(q))
    .filter((m) => !type || typeName(m) === type)
    .filter((m) => !cr || crOf(m) === cr)
    .filter((m) => !edition || !m.srdEditions || m.srdEditions.includes(edition))
    .sort((a, b) => crValue(crOf(a)) - crValue(crOf(b)) || a.name.localeCompare(b.name));
};

/** The values the filters offer: types, challenge ratings and SRD editions present in the data. */
export const filterOptions = (monsters) => ({
  types: [...new Set(monsters.map(typeName).filter(Boolean))].sort(),
  crs: [...new Set(monsters.map(crOf).filter(Boolean))].sort((a, b) => crValue(a) - crValue(b)),
  editions: [...new Set(monsters.flatMap((m) => m.srdEditions ?? []))].sort(),
});
