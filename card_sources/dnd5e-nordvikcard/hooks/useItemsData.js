import React from "react";

// Must match the slug derivation in dnd5e-template_settings' App.jsx exactly —
// that's how an item source's display name maps to the resource key it synced.
const slugify = (name) =>
  (name ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "source";

/**
 * Loads and merges every item resource configured in the game's shared
 * "dnd5e_config" property (parentId: gameId), under its "itemSources" list —
 * same multi-source pattern as useSpellsData.js (dnd5e-nordvikcard), so
 * homebrew item packs can be added alongside the SRD. Each source is synced
 * by the settings card as a resource keyed "dnd5e_items_{slug}"; this hook
 * fetches all of them in parallel and concatenates their `.item` arrays.
 */
export const useItemsData = (Api) => {
  const [items, setItems] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const promiseRef = React.useRef(null);

  const load = React.useCallback(async () => {
    if (items !== null || promiseRef.current) return;
    const p = (async () => {
      setLoading(true);
      setError(null);
      try {
        const gameId = await Api.ClientMediator.sendCommandAsync("Game", "GetGameId");
        const configProp = await Api.Properties.Global.Get(gameId, "dnd5e_config");
        if (!configProp?.value) { setItems([]); return; }

        let config;
        try {
          config = typeof configProp.value === "string" ? JSON.parse(configProp.value) : configProp.value;
        } catch {
          config = {};
        }

        const sources = Array.isArray(config.itemSources) ? config.itemSources : [];
        if (sources.length === 0) { setItems([]); return; }

        const results = await Promise.all(sources.map(async (source) => {
          const key = `dnd5e_items_${slugify(source.name)}`;
          try {
            const data = await Api.Resources.Global.Read(key);
            if (!data) return [];
            let parsed;
            if (data instanceof Blob)          parsed = JSON.parse(await data.text());
            else if (typeof data === "string") parsed = JSON.parse(data);
            else                               parsed = data;
            return parsed.item ?? [];
          } catch (e) {
            console.warn(`useItemsData: failed to load ${key}:`, e);
            return [];
          }
        }));

        setItems(results.flat());
      } catch (e) {
        console.error("useItemsData: failed to load items:", e);
        setError(e.message ?? "Load failed");
        setItems([]);
        promiseRef.current = null;
      } finally {
        setLoading(false);
      }
    })();
    promiseRef.current = p;
  }, [Api, items]);

  return { items, loading, error, load };
};
