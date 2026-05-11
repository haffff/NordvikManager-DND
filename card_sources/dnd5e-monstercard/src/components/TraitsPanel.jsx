import React from "react";
import { usePropertyList } from "../../hooks/usePropertyList";

let _idSeq = 0;
const mkId = () => `trait-${Date.now()}-${_idSeq++}`;

const blankTrait = () => ({ id: mkId(), name: "", description: "" });

const TraitItem = ({ item, index, editMode, updateItem, removeItem }) => {
  const [name, setName]   = React.useState(item.name ?? "");
  const [desc, setDesc]   = React.useState(item.description ?? "");

  React.useEffect(() => { setName(item.name ?? ""); }, [item.name]);
  React.useEffect(() => { setDesc(item.description ?? ""); }, [item.description]);

  const save = (overrides = {}) =>
    updateItem(index, { ...item, name, description: desc, ...overrides });

  return (
    <div className="monster_trait_item">
      {editMode ? (
        <div className="monster_trait_edit">
          <div className="monster_trait_edit_row">
            <input
              className="dnd5e_text_value monster_trait_name_input"
              placeholder="Trait name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => save()}
            />
            <button className="dnd5e_remove_btn" onClick={() => removeItem(index)}>✕</button>
          </div>
          <textarea
            className="monster_trait_desc_input"
            placeholder="Description…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={() => save()}
          />
        </div>
      ) : (
        <div className="monster_trait_view">
          <span className="monster_trait_view_name">{item.name}. </span>
          <span className="monster_trait_view_desc">{item.description}</span>
        </div>
      )}
    </div>
  );
};

export const TraitsPanel = ({ Api }) => {
  const [traits, , addTrait, removeTrait, updateTrait] = usePropertyList([Api, "traits", true]);
  const [editMode, setEditMode] = React.useState(false);

  return (
    <div className="dnd-panel">
      <div className="dnd-panel-title monster_panel_title_row">
        <span>Traits</span>
        <div className="monster_panel_toolbar">
          <button className="dnd5e_inventory_add_btn" onClick={() => { addTrait(blankTrait()); setEditMode(true); }}>+</button>
          <button
            className={`dnd5e_inventory_edit_btn${editMode ? " active" : ""}`}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "✓ Done" : "Edit"}
          </button>
        </div>
      </div>
      {traits.length === 0 && (
        <div className="dnd5e_inventory_empty">No traits yet.</div>
      )}
      {traits.map((trait, i) => (
        <TraitItem
          key={trait.id ?? i}
          item={trait}
          index={i}
          editMode={editMode}
          updateItem={updateTrait}
          removeItem={removeTrait}
        />
      ))}
    </div>
  );
};
