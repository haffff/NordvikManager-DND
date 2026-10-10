// Keeps only SRD content from the JSON source data. SRD 5.1 and SRD 5.2 are released by
// Wizards of the Coast under CC-BY-4.0 (attribution required, see the addon's README);
// everything else in those files (other books, fluff text, artwork) is not licensed.

// Entry flags: `srd` = SRD 5.1, `srd52` = SRD 5.2. `true`, or a string that is the
// SRD's own name for the entry. `basicRules*` is NOT a license (free to read only).
export const srdEditions = (entry) => {
  const editions = [];
  if (entry?.srd) editions.push("5.1");
  if (entry?.srd52) editions.push("5.2");
  return editions;
};

// References to the books themselves, and the SRD flags (replaced by srdEditions).
const BOOK_KEYS = [
  "page", "reprintedAs", "referenceSources", "additionalSources", "otherSources",
  "hasFluff", "hasFluffImages", "fluff", "lootTables",
  "basicRules", "basicRules2024", "srd", "srd52",
];

/** The entry as we may ship it: SRD name, no book references, tagged with its SRD edition(s). */
export const toSrdEntry = (entry) => {
  const srdName = typeof entry.srd52 === "string" ? entry.srd52 : typeof entry.srd === "string" ? entry.srd : null;
  const out = {};
  for (const [key, value] of Object.entries(entry)) {
    if (BOOK_KEYS.includes(key)) continue;
    out[key] = value;
    if (key === "source") out.srdEditions = srdEditions(entry);
  }
  if (!("srdEditions" in out)) out.srdEditions = srdEditions(entry);
  if (srdName) out.name = srdName;
  return out;
};

const isEntryList = (value) =>
  Array.isArray(value) && value.length > 0 && value.every((e) => e && typeof e === "object" && "name" in e);

/**
 * A data file reduced to its SRD entries: { [section]: { total, srd51, srd52, copies, entries } }
 * for every top-level list of named entries (feat, item, spell, monster, itemFluff, ...).
 */
export const extractSrd = (file) => {
  const result = {};
  for (const [section, list] of Object.entries(file ?? {})) {
    if (section.startsWith("_") || !isEntryList(list)) continue;
    const srd = list.filter((e) => srdEditions(e).length > 0);
    result[section] = {
      total: list.length,
      srd51: srd.filter((e) => e.srd).length,
      srd52: srd.filter((e) => e.srd52).length,
      // Built from another entry when the data is loaded; check the base is SRD too.
      copies: srd.filter((e) => e._copy).length,
      entries: srd.map(toSrdEntry),
    };
  }
  return result;
};
