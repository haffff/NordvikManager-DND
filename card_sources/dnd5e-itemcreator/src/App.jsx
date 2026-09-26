import React from "react";
import { FaPlus } from "react-icons/fa";
import { useItemsData } from "../hooks/useItemsData";
import { useGlobalProperty } from "../hooks/useGlobalProperty";
import { DMGTYPE_LABEL, entriesToText, formatValue, resolveTypeLabel, resolveSrdImageUrl, getSrdImageRef } from "./srdHelpers";
import "./App.css";

// Maps a raw SRD item (from the dnd5e_items resource) onto the generic semantic
// args dnd5e/create_item_from_srd expects — same fields Inventory5E.jsx's own
// srdItemToInventoryItem already derives, just without the inventory-specific
// ones (quantity/action/actionArgs/dmg1/dmgType don't apply to a standalone card).
const srdItemToCreateArgs = (srdItem) => ({
  name: srdItem.name,
  itemType: resolveTypeLabel(srdItem.type),
  rarity: srdItem.rarity && srdItem.rarity !== "none" ? srdItem.rarity : "",
  weight: String(srdItem.weight ?? ""),
  value: srdItem.value ? formatValue(srdItem.value) : "",
  description: entriesToText(srdItem.entries),
  imageRef: getSrdImageRef(srdItem),
});

const MAX_RESULTS = 50;

// gameId is fetched once, before AppInner mounts, so useGlobalProperty (below)
// never has to cope with its parentId changing after the fact — it only
// re-runs its fetch/subscribe effect when propertyName changes, not parentId,
// so calling it with a not-yet-resolved gameId would silently never refetch
// once the real id became available. Same App/AppInner split dnd5e-nordvikcard
// already uses for the same reason.
export const App = ({ Api, additionalArguments }) => {
  const [gameId, setGameId] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      const id = await Api.ClientMediator.sendCommandAsync("Game", "GetGameId");
      setGameId(id ?? "fallback");
    })();
  }, [Api]);

  if (!gameId) {
    return <div className="dnd5e_itemcreator_container">Loading…</div>;
  }
  return <AppInner Api={Api} additionalArguments={additionalArguments} gameId={gameId} />;
};

const AppInner = ({ Api, additionalArguments, gameId }) => {
  const [query, setQuery] = React.useState("");
  const [selectedKey, setSelectedKey] = React.useState(null);
  const { items, loading, error, load } = useItemsData(Api);
  const [imageBaseUrl] = useGlobalProperty([Api, "dnd5e_image_content_provider", "", gameId]);

  React.useEffect(() => { load(); }, [load]);

  // A plain, always-visible list rather than a type-to-reveal dropdown — the
  // search box only filters it, it doesn't gate whether it's shown at all.
  const results = React.useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    const filtered = q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
    return filtered.slice(0, MAX_RESULTS);
  }, [items, query]);

  const selectedItem = React.useMemo(
    () => items?.find((i) => `${i.name}|${i.source}` === selectedKey) ?? null,
    [items, selectedKey]
  );

  // additionalArguments is a raw JSON string, populated only when this card was
  // opened from the battle map's right-click "Add" menu (open_item_creator's
  // ShowView step threads %battleMapId%/%position% through) — absent, `null`, or
  // malformed (e.g. opened from the toolbar's "Create Item Card" entry instead,
  // which has no map-click context at all, so those variables never substituted)
  // all fall back to "no map context", matching today's card-only behavior.
  const mapContext = React.useMemo(() => {
    try {
      const parsed = additionalArguments ? JSON.parse(additionalArguments) : null;
      return parsed?.battleMapId && parsed?.position ? parsed : null;
    } catch {
      return null;
    }
  }, [additionalArguments]);

  const handleCreate = () => {
    if (!selectedItem) return;
    Api.FireAction("dnd5e/create_item_from_srd", {
      ...srdItemToCreateArgs(selectedItem),
      // Always sent (unlike battleMapId/position below) so the backend action's
      // "If" step has a variable it can reliably substitute either way — an
      // action-step variable that's simply absent gets left as literal "%text%"
      // by the substitution engine rather than becoming empty/false, which would
      // make a condition keyed on battleMapId/position's own presence unreliable.
      hasMapContext: mapContext ? "true" : "false",
      ...(mapContext ? { battleMapId: mapContext.battleMapId, position: mapContext.position } : {}),
    });
    Api.Close();
  };

  const placeholder = loading
    ? "Loading items…"
    : error
    ? `Error: ${error}`
    : "Search SRD items…";

  return (
    <div className="dnd5e_itemcreator_container">
      <div className="dnd5e_itemcreator_title">DND 5E Item Creator</div>
      <div className="dnd5e_itemcreator_subtitle">
        Select an item from the SRD list, then click Create.
      </div>

      <input
        autoFocus
        className="dnd5e_itemcreator_search_input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="dnd5e_itemcreator_list">
        {results.length === 0 && !loading && (
          <div className="dnd5e_itemcreator_empty">
            {query.trim() ? `No items found for "${query}"` : "No items available."}
          </div>
        )}
        {results.map((item) => {
          const key = `${item.name}|${item.source}`;
          const selected = key === selectedKey;
          const imageUrl = resolveSrdImageUrl(item, imageBaseUrl);
          return (
            <div
              key={key}
              className={`dnd5e_itemcreator_list_row${selected ? " selected" : ""}`}
              onClick={() => setSelectedKey(key)}
            >
              {imageUrl && (
                <img className="dnd5e_itemcreator_row_thumb" src={imageUrl} alt="" />
              )}
              <span className="dnd5e_itemcreator_row_name">{item.name}</span>
              <span className="dnd5e_item_search_result_tags">
                {item.source && (
                  <span className="dnd5e_item_tag dnd5e_item_tag_source">{item.source}</span>
                )}
                {item.dmg1 && (
                  <span className="dnd5e_item_tag dnd5e_item_tag_weapon">
                    {item.dmg1} {DMGTYPE_LABEL[item.dmgType] ?? item.dmgType}
                  </span>
                )}
                {item.type && (
                  <span className="dnd5e_item_tag">{resolveTypeLabel(item.type)}</span>
                )}
                {item.rarity && item.rarity !== "none" && (
                  <span className={`dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${item.rarity.replace(/\s/g, "_")}`}>
                    {item.rarity}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="dnd5e_itemcreator_footer">
        <button
          className="dnd5e_itemcreator_create_btn"
          disabled={!selectedItem}
          onClick={handleCreate}
        >
          <FaPlus size={10} /> Create
        </button>
      </div>
    </div>
  );
};

export default App;
