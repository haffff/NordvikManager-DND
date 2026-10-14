// Which game resources a list of data sources (dnd5e_config's itemSources, spellSources,
// ...) is read from. The game's own homebrew (made in the 5E Homebrew view) is always
// read as well, under the key a source named "Homebrew" would have.

// Must match the slug derivation in dnd5e-template_settings' srdSources.js exactly —
// that's how a source's display name maps to the resource key it synced.
export const slugify = (name) =>
  (name ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "source";

export const HOMEBREW_SLUG = "homebrew";

export const sourceKeys = (sources, resourcePrefix) => [
  ...new Set([...(sources ?? []).map((s) => `${resourcePrefix}${slugify(s.name)}`), `${resourcePrefix}${HOMEBREW_SLUG}`]),
];

// Entries marked "hidden" (in the 5E Homebrew view) are the GM's: left out of players' lists.
export const visibleEntries = (list, isGM) => (isGM ? list : list.filter((e) => !e?.hidden));

// Whether the viewer is the GM. False when the app doesn't answer (e.g. an older app
// that doesn't let cards ask), so hidden entries stay hidden.
export const viewerIsGM = async (Api) => {
  try {
    return (await Api.ClientMediator.sendCommandAsync("Game", "GetIsGM")) === true;
  } catch {
    return false;
  }
};
