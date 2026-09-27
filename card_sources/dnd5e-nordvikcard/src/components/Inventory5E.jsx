import React from "react";
import { FaSearch, FaPlus, FaMinus, FaGripVertical, FaDice, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { usePropertyList } from "../../hooks/usePropertyList";
import { useItemsData } from "../../hooks/useItemsData";
import { DMGTYPE_LABEL, entriesToText, formatValue, resolveTypeLabel, mkId } from "../srdHelpers";

const blankItem = () => ({
  id: mkId(),
  name: "",
  source: "",
  quantity: "1",
  weight: "",
  action: "",
  actionArgs: "",
  description: "",
  rarity: "",
  dmg1: "",
  dmgType: "",
  value: "",
  itemType: "",
});

const itemFromSrd = (item) => ({
  id: mkId(),
  name: item.name,
  source: item.source ?? "",
  quantity: "1",
  weight: String(item.weight ?? ""),
  action: "",
  actionArgs: "",
  description: entriesToText(item.entries),
  rarity: item.rarity && item.rarity !== "none" ? item.rarity : "",
  dmg1: item.dmg1 ?? "",
  dmgType: item.dmgType ?? "",
  value: item.value ? formatValue(item.value) : "",
  itemType: resolveTypeLabel(item.type),
});

const formatWeight = (w) => (w % 1 === 0 ? `${w}` : w.toFixed(1));

const ItemSearchPanel = ({ itemsData, onAdd, onClose }) => {
  const [query, setQuery] = React.useState("");
  const { items, loading, error, load } = itemsData;
  const inputRef = React.useRef(null);
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    load();
    inputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    const onMouseDown = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  const results = React.useMemo(() => {
    if (!items || query.trim().length < 1) return [];
    const q = query.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 20);
  }, [items, query]);

  return (
    <div className="dnd5e_item_search_panel" ref={panelRef}>
      <input
        ref={inputRef}
        className="dnd5e_item_search_input"
        placeholder={loading ? "Loading items…" : error ? `Error: ${error}` : "Search weapons & items…"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      {results.length > 0 && (
        <div className="dnd5e_item_search_results">
          {results.map((item) => (
            <div
              key={`${item.name}|${item.source}`}
              className="dnd5e_item_search_result"
              onMouseDown={(e) => {
                e.preventDefault();
                onAdd(itemFromSrd(item));
                onClose();
              }}
            >
              <span className="dnd5e_item_search_result_name">{item.name}</span>
              <span className="dnd5e_item_search_result_tags">
                {item.source && <span className="dnd5e_item_tag dnd5e_item_tag_source">{item.source}</span>}
                {item.dmg1 && (
                  <span className="dnd5e_item_tag dnd5e_item_tag_weapon">
                    {item.dmg1} {DMGTYPE_LABEL[item.dmgType] ?? item.dmgType}
                  </span>
                )}
                {item.type && <span className="dnd5e_item_tag">{resolveTypeLabel(item.type)}</span>}
                {item.rarity && item.rarity !== "none" && (
                  <span className={`dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${item.rarity.replace(/\s/g, "_")}`}>
                    {item.rarity}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      {query.trim().length > 0 && items && results.length === 0 && !loading && (
        <div className="dnd5e_item_search_empty">No items found for "{query}"</div>
      )}
    </div>
  );
};

export const Inventory5E = ({ Api }) => {
  const [items, , addItem, removeItem, updateItem] = usePropertyList([Api, "inventory", true]);
  const [edit, setEdit] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const itemsData = useItemsData(Api);
  const dragRef = React.useRef(null);

  const totalWeight = React.useMemo(
    () => items.reduce((sum, item) => sum + parseFloat(item.weight || 0) * parseInt(item.quantity || 0), 0),
    [items]
  );

  return (
    <div className="dnd5e_inventory_container">
      <div className="dnd5e_inventory_toolbar">
        <button
          className="dnd5e_inventory_search_btn"
          onClick={() => {
            setSearchOpen((v) => !v);
          }}
        >
          <FaSearch />
          <span>Search Items</span>
        </button>
        <button className="dnd5e_inventory_add_btn" title="Add blank item" onClick={() => addItem(blankItem())}>
          <FaPlus />
        </button>
        <div style={{ flex: 1 }} />
        <button className={`dnd5e_inventory_edit_btn${edit ? " active" : ""}`} onClick={() => setEdit(!edit)}>
          {edit ? "✓ Done" : "Edit"}
        </button>
      </div>
      {searchOpen && <ItemSearchPanel itemsData={itemsData} onAdd={addItem} onClose={() => setSearchOpen(false)} />}
      {items.length > 0 && (
        <div className="dnd5e_inventory_header">
          <div className="dnd5e_inventory_col_icon" />
          <div className="dnd5e_inventory_col_name">Item</div>
          <div className="dnd5e_inventory_col_qty">Qty</div>
          <div className="dnd5e_inventory_col_weight">Total Wt</div>
          <div className="dnd5e_inventory_col_end" />
        </div>
      )}
      <div className="dnd5e_inventory_list">
        {items.length === 0 && (
          <div className="dnd5e_inventory_empty">
            <span>No items yet.</span>
            <span>Search the SRD or add a blank item above.</span>
          </div>
        )}
        {items.map((item, index) => (
          <InventoryItem
            key={item.id ?? "inventory_item_" + index + item.name}
            Api={Api}
            item={item}
            index={index}
            edit={edit}
            removeItem={removeItem}
            updateItem={updateItem}
            onDragStart={(dragged, draggedIndex) => {
              dragRef.current = { item: dragged, index: draggedIndex };
            }}
            onDrop={(targetIndex) => {
              if (!dragRef.current) return;
              const { index: sourceIndex, item: dragged } = dragRef.current;
              if (sourceIndex !== targetIndex) {
                updateItem(targetIndex, dragged);
                updateItem(sourceIndex, { ...items[targetIndex] });
              }
              dragRef.current = null;
            }}
          />
        ))}
      </div>
      {items.length > 0 && (
        <div className="dnd5e_inventory_weight_summary">
          <span>Carried Weight</span>
          <span>{formatWeight(totalWeight)} lb</span>
        </div>
      )}
    </div>
  );
};

const InventoryItem = ({ Api, item, index, removeItem, edit, onDragStart, updateItem, onDrop }) => {
  const [name, setName] = React.useState(item.name);
  const [quantity, setQuantity] = React.useState(item.quantity ?? "1");
  const [weight, setWeight] = React.useState(item.weight);
  const [action, setAction] = React.useState(item.action);
  const [actionArgs, setActionArgs] = React.useState(item.actionArgs ?? "");
  const [expanded, setExpanded] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);

  const save = (overrides = {}) => {
    updateItem(index, { ...item, name, quantity, weight, action, actionArgs, ...overrides });
  };

  const stepQuantity = (delta) => {
    const next = String(Math.max(0, parseInt(quantity || "0") + delta));
    setQuantity(next);
    save({ quantity: next });
  };

  const use = () => {
    if (!item.action) return;
    let extraArgs = {};
    try {
      const parsed = item.actionArgs ? JSON.parse(item.actionArgs) : {};
      if (typeof parsed === "object" && parsed && !Array.isArray(parsed)) extraArgs = parsed;
    } catch {}
    Api.FireAction(item.action, { name: item.name, quantity: item.quantity, weight: item.weight, ...extraArgs });
  };

  const hasDetails = item.description || item.rarity || item.dmg1 || item.value || item.itemType;
  const paragraphs = (item.description ?? "").split("\n\n").filter(Boolean);
  const weightEach = parseFloat(weight || 0);
  const qty = parseInt(quantity || 0);
  const rowWeight = weightEach > 0 && qty > 0 ? weightEach * qty : null;

  return (
    <div
      draggable={edit}
      onDragStart={() => onDragStart(item, index)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (onDrop) onDrop(index);
      }}
      className={`dnd5e_inventory_item${dragOver ? " drag-over" : ""}`}
    >
      <div className="dnd5e_inventory_item_row">
        {edit ? (
          <div className="dnd5e_inventory_col_icon dnd5e_drag_handle" title="Drag to reorder">
            <FaGripVertical size={11} />
          </div>
        ) : (
          <div
            className="dnd5e_inventory_col_icon dnd5e_inventory_item_toggle"
            style={{ opacity: hasDetails ? 1 : 0.25, cursor: hasDetails ? "pointer" : "default" }}
            onClick={() => hasDetails && setExpanded((v) => !v)}
          >
            {expanded ? <FaChevronDown size={9} /> : <FaChevronRight size={9} />}
          </div>
        )}
        <div
          className="dnd5e_inventory_col_name dnd5e_inventory_item_name"
          onClick={() => !edit && hasDetails && setExpanded((v) => !v)}
          style={{ cursor: !edit && hasDetails ? "pointer" : "default" }}
        >
          {edit ? (
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => save()} placeholder="Item name" />
          ) : (
            <span className={hasDetails ? "dnd5e_item_name_link" : ""}>
              {name || <em className="dnd5e_item_name_placeholder">Unnamed</em>}
            </span>
          )}
        </div>
        <div className="dnd5e_inventory_col_qty">
          {edit ? (
            <input
              className="dnd5e_inventory_qty_input"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              onBlur={() => save()}
            />
          ) : (
            <div className="dnd5e_qty_stepper">
              <button className="dnd5e_qty_btn" onClick={() => stepQuantity(-1)} title="Decrease">
                −
              </button>
              <span className="dnd5e_qty_val">{quantity}</span>
              <button className="dnd5e_qty_btn" onClick={() => stepQuantity(1)} title="Increase">
                +
              </button>
            </div>
          )}
        </div>
        <div className="dnd5e_inventory_col_weight">
          {edit ? (
            <input
              className="dnd5e_inventory_wt_input"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onBlur={() => save()}
              placeholder="lb ea"
            />
          ) : rowWeight == null ? null : (
            <span className="dnd5e_inventory_wt_label">
              {formatWeight(rowWeight)}
              <em>lb</em>
            </span>
          )}
        </div>
        <div className="dnd5e_inventory_col_end">
          {!edit && item.action && (
            <button className="dnd5e_use_btn" onClick={use} title={`Use: ${item.action}`}>
              <FaDice size={10} /> Use
            </button>
          )}
          {edit && (
            <button className="dnd5e_remove_btn" onClick={() => removeItem(index)} title="Remove item">
              <FaMinus size={9} />
            </button>
          )}
        </div>
      </div>
      {edit && (
        <div className="dnd5e_inventory_edit_extras">
          <input
            className="dnd5e_inventory_action_input"
            placeholder="Action name (optional)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            onBlur={() => save()}
          />
          <input
            className="dnd5e_inventory_action_input"
            placeholder='Action args, e.g. {"damage":"1d6"}'
            value={actionArgs}
            onChange={(e) => setActionArgs(e.target.value)}
            onBlur={() => save()}
          />
        </div>
      )}
      {expanded && hasDetails && (
        <div className="dnd5e_inventory_item_details">
          <div className="dnd5e_inventory_item_tags">
            {item.itemType && <span className="dnd5e_item_tag">{item.itemType}</span>}
            {item.dmg1 && (
              <span className="dnd5e_item_tag dnd5e_item_tag_weapon">
                {item.dmg1}
                {item.dmgType ? ` ${DMGTYPE_LABEL[item.dmgType] ?? item.dmgType}` : ""}
              </span>
            )}
            {item.rarity && (
              <span className={`dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${item.rarity.replace(/\s/g, "_")}`}>
                {item.rarity}
              </span>
            )}
            {item.value && <span className="dnd5e_item_tag dnd5e_item_tag_value">{item.value}</span>}
            {item.weight && <span className="dnd5e_item_tag">{item.weight} lb ea</span>}
          </div>
          {paragraphs.map((p, i) => (
            <p key={i} className="dnd5e_inventory_item_desc">
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
