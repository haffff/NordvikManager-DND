import React from "react";
import { FaSearch, FaPlus, FaMinus, FaGripVertical, FaDice, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { usePropertyList } from "../../hooks/usePropertyList";
import { useItemsData } from "../../hooks/useItemsData";
import { DMGTYPE_LABEL, entriesToText, resolveTypeLabel, mkId } from "../srdHelpers";

// SRD item types that count as weapons (melee / ranged).
const WEAPON_TYPES = new Set(["M", "R"]);

const blankWeapon = () => ({
  id: mkId(),
  name: "",
  source: "",
  attackBonus: "+0",
  damage: "1d6",
  damageType: "Slashing",
  action: "dnd_attack",
  actionArgs: "",
  description: "",
  rarity: "",
  itemType: "",
  weaponCategory: "",
});

const weaponFromSrd = (item) => ({
  id: mkId(),
  name: item.name,
  source: item.source ?? "",
  attackBonus: "+0",
  damage: item.dmg1 ?? "",
  damageType: DMGTYPE_LABEL[item.dmgType] ?? item.dmgType ?? "",
  action: "dnd_attack",
  actionArgs: "",
  description: entriesToText(item.entries),
  rarity: item.rarity && item.rarity !== "none" ? item.rarity : "",
  itemType: resolveTypeLabel(item.type),
  weaponCategory: item.weaponCategory ?? "",
});

const WeaponSearchPanel = ({ itemsData, onAdd, onClose }) => {
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
    return items
      .filter((item) => WEAPON_TYPES.has(item.type?.split("|")[0]) && item.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [items, query]);

  return (
    <div className="dnd5e_item_search_panel" ref={panelRef}>
      <input
        ref={inputRef}
        className="dnd5e_item_search_input"
        placeholder={loading ? "Loading weapons…" : error ? `Error: ${error}` : "Search weapons…"}
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
                onAdd(weaponFromSrd(item));
                onClose();
              }}
            >
              <span className="dnd5e_item_search_result_name">{item.name}</span>
              <span className="dnd5e_item_search_result_tags">
                {item.source && <span className="dnd5e_item_tag dnd5e_item_tag_source">{item.source}</span>}
                {item.dmg1 && (
                  <span className="dnd5e_item_tag dnd5e_item_tag_weapon">
                    {item.dmg1} {DMGTYPE_LABEL[item.dmgType] ?? item.dmgType ?? ""}
                  </span>
                )}
                {item.weaponCategory && <span className="dnd5e_item_tag">{item.weaponCategory}</span>}
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
        <div className="dnd5e_item_search_empty">No weapons found for "{query}"</div>
      )}
    </div>
  );
};

export const Weapons5E = ({ Api }) => {
  const [weapons, , addWeapon, removeWeapon, updateWeapon] = usePropertyList([Api, "weapons", true]);
  const [edit, setEdit] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const itemsData = useItemsData(Api);
  const dragRef = React.useRef(null);

  return (
    <div className="dnd5e_inventory_container">
      <div className="dnd5e_inventory_toolbar">
        <button className="dnd5e_inventory_search_btn" onClick={() => setSearchOpen((v) => !v)}>
          <FaSearch />
          <span>Search Weapons</span>
        </button>
        <button className="dnd5e_inventory_add_btn" title="Add blank weapon" onClick={() => addWeapon(blankWeapon())}>
          <FaPlus />
        </button>
        <div style={{ flex: 1 }} />
        <button className={`dnd5e_inventory_edit_btn${edit ? " active" : ""}`} onClick={() => setEdit(!edit)}>
          {edit ? "✓ Done" : "Edit"}
        </button>
      </div>
      {searchOpen && <WeaponSearchPanel itemsData={itemsData} onAdd={addWeapon} onClose={() => setSearchOpen(false)} />}
      {weapons.length > 0 && (
        <div className="dnd5e_inventory_header">
          <div className="dnd5e_weapon_col_icon" />
          <div className="dnd5e_weapon_col_name">Weapon</div>
          <div className="dnd5e_weapon_col_bonus">Atk</div>
          <div className="dnd5e_weapon_col_damage">Damage</div>
          <div className="dnd5e_weapon_col_end" />
        </div>
      )}
      <div className="dnd5e_inventory_list">
        {weapons.length === 0 && (
          <div className="dnd5e_inventory_empty">
            <span>No weapons yet.</span>
            <span>Search the SRD or add a blank weapon above.</span>
          </div>
        )}
        {weapons.map((weapon, index) => (
          <WeaponItem
            key={weapon.id ?? `weapon_${index}_${weapon.name}`}
            Api={Api}
            item={weapon}
            index={index}
            edit={edit}
            removeItem={removeWeapon}
            updateItem={updateWeapon}
            onDragStart={(dragged, draggedIndex) => {
              dragRef.current = { item: dragged, index: draggedIndex };
            }}
            onDrop={(targetIndex) => {
              if (!dragRef.current) return;
              const { index: sourceIndex, item: dragged } = dragRef.current;
              if (sourceIndex !== targetIndex) {
                updateWeapon(targetIndex, dragged);
                updateWeapon(sourceIndex, { ...weapons[targetIndex] });
              }
              dragRef.current = null;
            }}
          />
        ))}
      </div>
    </div>
  );
};

const WeaponItem = ({ Api, item, index, removeItem, edit, onDragStart, updateItem, onDrop }) => {
  const [name, setName] = React.useState(item.name ?? "");
  const [attackBonus, setAttackBonus] = React.useState(item.attackBonus ?? "+0");
  const [damage, setDamage] = React.useState(item.damage ?? "");
  const [damageType, setDamageType] = React.useState(item.damageType ?? "");
  const [action, setAction] = React.useState(item.action ?? "");
  const [actionArgs, setActionArgs] = React.useState(item.actionArgs ?? "");
  const [expanded, setExpanded] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);

  const save = (overrides = {}) => {
    updateItem(index, { ...item, name, attackBonus, damage, damageType, action, actionArgs, ...overrides });
  };

  const attack = () => {
    if (!item.action) return;
    let extraArgs = {};
    try {
      const parsed = item.actionArgs ? JSON.parse(item.actionArgs) : {};
      if (typeof parsed === "object" && parsed && !Array.isArray(parsed)) extraArgs = parsed;
    } catch {}
    Api.FireAction(item.action, {
      name: item.name,
      attackBonus: item.attackBonus,
      damage: item.damage,
      damageType: item.damageType,
      ...extraArgs,
    });
  };

  const hasDetails = item.description || item.rarity || item.weaponCategory || item.itemType;
  const paragraphs = (item.description ?? "").split("\n\n").filter(Boolean);

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
          <div className="dnd5e_weapon_col_icon dnd5e_drag_handle" title="Drag to reorder">
            <FaGripVertical size={11} />
          </div>
        ) : (
          <div
            className="dnd5e_weapon_col_icon dnd5e_inventory_item_toggle"
            style={{ opacity: hasDetails ? 1 : 0.25, cursor: hasDetails ? "pointer" : "default" }}
            onClick={() => hasDetails && setExpanded((v) => !v)}
          >
            {expanded ? <FaChevronDown size={9} /> : <FaChevronRight size={9} />}
          </div>
        )}
        <div
          className="dnd5e_weapon_col_name dnd5e_inventory_item_name"
          onClick={() => !edit && hasDetails && setExpanded((v) => !v)}
          style={{ cursor: !edit && hasDetails ? "pointer" : "default" }}
        >
          {edit ? (
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => save()} placeholder="Weapon name" />
          ) : (
            <span className={hasDetails ? "dnd5e_item_name_link" : ""}>
              {name || <em className="dnd5e_item_name_placeholder">Unnamed</em>}
            </span>
          )}
        </div>
        <div className="dnd5e_weapon_col_bonus">
          <input
            className="dnd5e_weapon_field_input"
            value={attackBonus}
            onChange={(e) => setAttackBonus(e.target.value)}
            onBlur={() => save()}
            placeholder="+0"
            readOnly={!edit && false}
          />
        </div>
        <div className="dnd5e_weapon_col_damage">
          {edit ? (
            <div className="dnd5e_weapon_damage_edit">
              <input
                className="dnd5e_weapon_field_input"
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                onBlur={() => save()}
                placeholder="1d6"
              />
              <input
                className="dnd5e_weapon_field_input dnd5e_weapon_dmgtype_input"
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                onBlur={() => save()}
                placeholder="Type"
              />
            </div>
          ) : (
            <span className="dnd5e_weapon_damage_label">
              {damage}
              {damageType ? <em> {damageType}</em> : null}
            </span>
          )}
        </div>
        <div className="dnd5e_weapon_col_end">
          {!edit && item.action && (
            <button className="dnd5e_use_btn" onClick={attack} title={`Fire: ${item.action}`}>
              <FaDice size={10} /> Attack
            </button>
          )}
          {edit && (
            <button className="dnd5e_remove_btn" onClick={() => removeItem(index)} title="Remove">
              <FaMinus size={9} />
            </button>
          )}
        </div>
      </div>
      {edit && (
        <div className="dnd5e_inventory_edit_extras">
          <input
            className="dnd5e_inventory_action_input"
            placeholder="Action name (default: dnd_attack)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            onBlur={() => save()}
          />
          <input
            className="dnd5e_inventory_action_input"
            placeholder='Action args, e.g. {"crit":"20"}'
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
            {item.weaponCategory && <span className="dnd5e_item_tag">{item.weaponCategory}</span>}
            {item.rarity && (
              <span className={`dnd5e_item_tag dnd5e_item_tag_rarity dnd5e_item_rarity_${item.rarity.replace(/\s/g, "_")}`}>
                {item.rarity}
              </span>
            )}
            {item.source && <span className="dnd5e_item_tag dnd5e_item_tag_source">{item.source}</span>}
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
