import React from "react";

/**
 * Generic hook for loading any SRD resource from Api.Resources.Global.
 * Handles Blob / string / plain-object responses.
 *
 * @param {object} Api
 * @param {string} resourceKey   - e.g. "dnd5e_items"
 * @param {function} extract     - receives the parsed JSON object, returns the array
 *                                 e.g. (d) => d.item ?? d
 */
export const useResourceData = (Api, resourceKey, extract) => {
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
        const data = await Api.Resources.Global.Read(resourceKey);
        if (!data) { setItems([]); return; }
        let parsed;
        if (data instanceof Blob) {
          parsed = JSON.parse(await data.text());
        } else if (typeof data === "string") {
          parsed = JSON.parse(data);
        } else {
          parsed = data;
        }
        setItems(extract ? extract(parsed) : (parsed.item ?? parsed));
      } catch (e) {
        console.error(`Failed to load ${resourceKey}:`, e);
        setError(e.message ?? "Load failed");
        setItems([]);
        promiseRef.current = null;
      } finally {
        setLoading(false);
      }
    })();
    promiseRef.current = p;
  }, [Api, resourceKey, items]);

  return { items, loading, error, load };
};
