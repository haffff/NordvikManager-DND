import React from "react";
import { sourceKeys, visibleEntries, viewerIsGM } from "../src/sourceKeys.js";

/**
 * Loads and merges every source of one kind configured in the game's shared
 * "dnd5e_config" property (parentId: gameId), e.g. its "spellSources" list.
 * Each source is synced by the settings card as a resource keyed
 * `{resourcePrefix}{slug}`; this hook fetches all of them in parallel, plus the
 * game's homebrew (`{resourcePrefix}homebrew`, see src/sourceKeys.js), and
 * concatenates the lists `extract` picks out of each file. Entries marked hidden
 * (GM-only homebrew) are left out unless the viewer is the GM.
 *
 * @param {string} configKey       - e.g. "spellSources"
 * @param {string} resourcePrefix  - e.g. "dnd5e_spells_"
 * @param {function} extract       - parsed file -> array, e.g. (d) => d.spell ?? d.item
 */
export const useSourceData = (Api, configKey, resourcePrefix, extract) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const promiseRef = React.useRef(null);

  const load = React.useCallback(async () => {
    if (data !== null || promiseRef.current) return;
    const p = (async () => {
      setLoading(true);
      setError(null);
      try {
        const gameId = await Api.ClientMediator.sendCommandAsync("Game", "GetGameId");
        const [configProp, isGM] = await Promise.all([
          Api.Properties.Global.Get(gameId, "dnd5e_config"),
          viewerIsGM(Api),
        ]);

        let config;
        try {
          config = typeof configProp?.value === "string" ? JSON.parse(configProp.value) : (configProp?.value ?? {});
        } catch {
          config = {};
        }

        const sources = Array.isArray(config[configKey]) ? config[configKey] : [];
        const results = await Promise.all(sourceKeys(sources, resourcePrefix).map(async (key) => {
          try {
            const raw = await Api.Resources.Global.Read(key);
            if (!raw) return [];
            let parsed;
            if (raw instanceof Blob)          parsed = JSON.parse(await raw.text());
            else if (typeof raw === "string") parsed = JSON.parse(raw);
            else                              parsed = raw;
            return extract(parsed) ?? [];
          } catch (e) {
            console.warn(`useSourceData: failed to load ${key}:`, e);
            return [];
          }
        }));

        setData(visibleEntries(results.flat(), isGM));
      } catch (e) {
        console.error(`useSourceData: failed to load ${configKey}:`, e);
        setError(e.message ?? "Load failed");
        setData([]);
        promiseRef.current = null;
      } finally {
        setLoading(false);
      }
    })();
    promiseRef.current = p;
    // `extract` is an inline arrow in every caller (a new one each render); it only
    // picks the list out of the file, so the first one is as good as any.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Api, data, configKey, resourcePrefix]);

  return { data, loading, error, load };
};
