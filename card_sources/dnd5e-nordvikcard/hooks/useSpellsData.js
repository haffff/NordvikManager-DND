import React from "react";

// Must match the slug derivation in dnd5e-template_settings' App.jsx exactly —
// that's how a spell source's display name maps to the resource key it synced.
const slugify = (name) =>
  (name ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "source";

/**
 * Loads and merges every spell resource configured in the game's shared
 * "dnd5e_config" property (parentId: gameId), under its "spellSources" list.
 * Each source is synced by the settings card as a resource keyed
 * "dnd5e_spells_{slug}"; this hook fetches all of them in parallel and
 * concatenates their `.spell` (or `.item`) arrays.
 */
export const useSpellsData = (Api) => {
  const [spells, setSpells] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const promiseRef = React.useRef(null);

  const load = React.useCallback(async () => {
    if (spells !== null || promiseRef.current) return;
    const p = (async () => {
      setLoading(true);
      setError(null);
      try {
        const gameId = await Api.ClientMediator.sendCommandAsync("Game", "GetGameId");
        const configProp = await Api.Properties.Global.Get(gameId, "dnd5e_config");
        if (!configProp?.value) { setSpells([]); return; }

        let config;
        try {
          config = typeof configProp.value === "string" ? JSON.parse(configProp.value) : configProp.value;
        } catch {
          config = {};
        }

        const sources = Array.isArray(config.spellSources) ? config.spellSources : [];
        if (sources.length === 0) { setSpells([]); return; }

        const results = await Promise.all(sources.map(async (source) => {
          const key = `dnd5e_spells_${slugify(source.name)}`;
          try {
            const data = await Api.Resources.Global.Read(key);
            if (!data) return [];
            let parsed;
            if (data instanceof Blob)          parsed = JSON.parse(await data.text());
            else if (typeof data === "string") parsed = JSON.parse(data);
            else                               parsed = data;
            return parsed.spell ?? parsed.item ?? [];
          } catch (e) {
            console.warn(`useSpellsData: failed to load ${key}:`, e);
            return [];
          }
        }));

        setSpells(results.flat());
      } catch (e) {
        console.error("useSpellsData: failed to load spells:", e);
        setError(e.message ?? "Load failed");
        setSpells([]);
        promiseRef.current = null;
      } finally {
        setLoading(false);
      }
    })();
    promiseRef.current = p;
  }, [Api, spells]);

  return { spells, loading, error, load };
};
