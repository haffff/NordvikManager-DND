import React from "react";

/**
 * Loads and merges all spell resources whose keys start with "5e_spells_".
 * Discovers available source suffixes via the global property "5e_sources_list"
 * (parentId "global"), then loads each "5e_spells_{suffix}" resource in parallel.
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
        const prop = await Api.Properties.Global.Get("global", "5e_sources_list");
        if (!prop) { setSpells([]); return; }

        let suffixes;
        try {
          suffixes = typeof prop.value === "string" ? JSON.parse(prop.value) : prop.value;
        } catch {
          suffixes = [];
        }

        if (!Array.isArray(suffixes) || suffixes.length === 0) { setSpells([]); return; }

        const results = await Promise.all(suffixes.map(async (suffix) => {
          const key = `5e_spells_${suffix}`;
          try {
            const data = await Api.Resources.Global.Read(key);
            if (!data) return [];
            let parsed;
            if (data instanceof Blob)          parsed = JSON.parse(await data.text());
            else if (typeof data === "string") parsed = JSON.parse(data);
            else                               parsed = data;
            return parsed.spell ?? [];
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
