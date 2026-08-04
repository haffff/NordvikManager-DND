import React from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import { useItemsData } from "../hooks/useItemsData";
import { DMGTYPE_LABEL, entriesToText, formatValue, resolveTypeLabel } from "./srdHelpers";
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
});

export const App = ({ Api }) => {
  const [query, setQuery] = React.useState("");
  const [createdKeys, setCreatedKeys] = React.useState(() => new Set());
  const { items, loading, error, load } = useItemsData(Api);

  React.useEffect(() => { load(); }, [load]);

  const results = React.useMemo(() => {
    if (!items || query.trim().length < 1) return [];
    const q = query.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 30);
  }, [items, query]);

  const handleCreate = (item, key) => {
    Api.FireAction("dnd5e/create_item_from_srd", srdItemToCreateArgs(item));
    setCreatedKeys((prev) => new Set(prev).add(key));
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
        Search the SRD item list and create a pre-filled Item Card.
      </div>

      <div className="dnd5e_item_search_panel">
        <input
          autoFocus
          className="dnd5e_item_search_input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {results.length > 0 && (
          <div className="dnd5e_item_search_results">
            {results.map((item) => {
              const key = `${item.name}|${item.source}`;
              const created = createdKeys.has(key);
              return (
                <div key={key} className="dnd5e_item_search_result">
                  <span className="dnd5e_item_search_result_name">{item.name}</span>
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
                    <button
                      className="dnd5e_itemcreator_result_create_btn"
                      disabled={created}
                      onClick={() => handleCreate(item, key)}
                    >
                      <FaPlus size={9} /> {created ? "Created" : "Create Item Card"}
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {query.trim().length > 0 && items && results.length === 0 && !loading && (
          <div className="dnd5e_item_search_empty">No items found for "{query}"</div>
        )}

        {query.trim().length === 0 && (
          <div className="dnd5e_itemcreator_status">
            <FaSearch size={10} /> Start typing to search the SRD item list.
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
