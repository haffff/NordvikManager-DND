// Turns the SRD-only extract (see srdFilter.mjs) into the files the addon ships in
// data/srd-5.1/ and data/srd-5.2/: one edition each, links to content we don't ship
// turned into plain text, nested non-SRD blocks dropped, and the SRD license attached.

export const LICENSES = {
  "5.1":
    "This work includes material taken from the System Reference Document 5.1 (\"SRD 5.1\") by Wizards of the Coast LLC " +
    "and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the " +
    "Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode. " +
    "Converted to JSON and edited (formatting, cross-references) for NordvikManager.",
  "5.2":
    "This work includes material from the System Reference Document 5.2.1 (\"SRD 5.2.1\") by Wizards of the Coast LLC, " +
    "available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 " +
    "International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. " +
    "Converted to JSON and edited (formatting, cross-references) for NordvikManager.",
};

// Tags linking to data we ship: kept when the target is in the same edition's files.
const SHIPPED_TAGS = { spell: "spell", item: "item", feat: "feat", language: "language", creature: "monster" };
// Tags linking to data we don't ship, or to the books: their text only.
const TEXT_ONLY_TAGS = new Set([
  "creature", "race", "background", "class", "subclass", "classFeature", "subclassFeature", "optfeature",
  "deity", "vehicle", "vehupgrade", "object", "table", "hazard", "trap", "disease", "card", "deck", "reward",
  "psionic", "boon", "cult", "recipe", "facility", "itemMastery", "charoption", "legroup", "language",
  "spell", "item", "feat",
]);
// Links whose first part is the display text (the rest is a book, page or URL).
const FIRST_PART_TAGS = new Set(["book", "filter", "link", "adventure", "quickref", "footnote"]);

// Books the SRD entries come from; a nested block from any other book is not SRD.
const SRD_SOURCES = new Set(["PHB", "XPHB", "DMG", "XDMG", "MM", "XMM"]);
// References to content we don't ship (pages, sound, art, lair data), at any depth.
const DROP_KEYS = new Set([
  "page", "classFeatures", "optionalfeatures", "seeAlsoVehicle", "seeAlsoDeck", "hasRefs", "fonts", "_versions",
  "soundClip", "hasToken", "altArt", "foundryTokenScale", "legendaryGroup", "familiar",
]);
// Search/filter tag lists of the source data; nothing in the addon reads them.
const INTERNAL_TAG_KEYS = /^(traitTags|senseTags|actionTags|languageTags|miscTags|spellcastingTags)$|^(damageTags|conditionInflict|savingThrowForced)/;
const isDropped = (key) => DROP_KEYS.has(key) || INTERNAL_TAG_KEYS.test(key);

/** Innermost {@tag ...} links resolved: kept, or replaced by their text. */
export const cleanText = (text, refs) =>
  text.replace(/\{@(\w+) ([^{}]*)\}/g, (whole, tag, body) => {
    const parts = body.split("|");
    if (FIRST_PART_TAGS.has(tag)) return parts[0];
    const kind = SHIPPED_TAGS[tag];
    if (kind && refs[kind]?.has(parts[0].trim().toLowerCase())) return whole;
    if (TEXT_ONLY_TAGS.has(tag)) return parts[2] || parts[0];
    return whole;
  });

const isForeignBlock = (v) => v && typeof v === "object" && !Array.isArray(v) && typeof v.source === "string" && !SRD_SOURCES.has(v.source);

/** Strings cleaned, book references and non-SRD nested blocks removed, at any depth. */
export const cleanValue = (value, refs) => {
  if (typeof value === "string") return cleanText(value, refs);
  if (Array.isArray(value)) return value.filter((v) => !isForeignBlock(v)).map((v) => cleanValue(v, refs));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      if (!isDropped(key)) out[key] = cleanValue(v, refs);
    }
    return out;
  }
  return value;
};

const ofEdition = (list, edition) => (list ?? []).filter((e) => e.srdEditions?.includes(edition));
const names = (list) => new Set(list.map((e) => e.name.toLowerCase()));

/**
 * The shipped files for one edition, from { items, baseItems, spells, feats, languages, monsters }
 * (SRD entries with srdEditions). Wrapper keys are the ones the cards read.
 */
export const buildEdition = (edition, srd) => {
  const items = [...ofEdition(srd.items, edition), ...ofEdition(srd.baseItems, edition)];
  const spells = ofEdition(srd.spells, edition);
  const feats = ofEdition(srd.feats, edition);
  const languages = ofEdition(srd.languages, edition);
  const monsters = ofEdition(srd.monsters, edition);
  const refs = { item: names(items), spell: names(spells), feat: names(feats), language: names(languages), monster: names(monsters) };

  const file = (key, list) => ({
    _meta: { license: LICENSES[edition], edition: `SRD ${edition}` },
    [key]: list.map((e) => cleanValue(e, refs)),
  });
  return {
    "items.json": file("item", items),
    "spells.json": file("spell", spells),
    "feats.json": file("feat", feats),
    "languages.json": file("language", languages),
    "monsters.json": file("monster", monsters),
  };
};
