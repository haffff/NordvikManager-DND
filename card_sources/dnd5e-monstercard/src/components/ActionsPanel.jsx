import React from "react";
import { usePropertyList } from "../../hooks/usePropertyList";

let _idSeq = 0;
const mkId = () => `action-${Date.now()}-${_idSeq++}`;

const ACTION_TYPES = ["attack", "save", "other"];

const blankAction = () => ({
  id: mkId(),
  name: "",
  type: "attack",
  recharge: "",
  attackBonus: "+0",
  damage: "1d6",
  damageType: "Bludgeoning",
  reach: "5 ft.",
  range: "",
  saveDc: "",
  saveAbility: "",
  description: "",
});

const ActionItem = ({ item, index, editMode, updateItem, removeItem }) => {
  const [name, setName]           = React.useState(item.name ?? "");
  const [type, setType]           = React.useState(item.type ?? "attack");
  const [recharge, setRecharge]   = React.useState(item.recharge ?? "");
  const [attackBonus, setAtkBonus]= React.useState(item.attackBonus ?? "+0");
  const [damage, setDamage]       = React.useState(item.damage ?? "");
  const [damageType, setDmgType]  = React.useState(item.damageType ?? "");
  const [reach, setReach]         = React.useState(item.reach ?? "");
  const [range, setRange]         = React.useState(item.range ?? "");
  const [saveDc, setSaveDc]       = React.useState(item.saveDc ?? "");
  const [saveAbility, setSaveAbi] = React.useState(item.saveAbility ?? "");
  const [desc, setDesc]           = React.useState(item.description ?? "");
  const [expanded, setExpanded]   = React.useState(false);

  React.useEffect(() => {
    setName(item.name ?? ""); setType(item.type ?? "attack"); setRecharge(item.recharge ?? "");
    setAtkBonus(item.attackBonus ?? "+0"); setDamage(item.damage ?? "");
    setDmgType(item.damageType ?? ""); setReach(item.reach ?? "");
    setRange(item.range ?? ""); setSaveDc(item.saveDc ?? ""); setSaveAbi(item.saveAbility ?? "");
    setDesc(item.description ?? "");
  }, [item]);

  const save = (overrides = {}) =>
    updateItem(index, { ...item, name, type, recharge, attackBonus, damage, damageType, reach, range, saveDc, saveAbility, description: desc, ...overrides });

  const fireAction = () => {
    Api?.FireAction?.("dnd5e.monster_action", { name: item.name, attackBonus: item.attackBonus, damage: item.damage, damageType: item.damageType });
  };

  const titleSuffix = type === "attack"
    ? ` — ${attackBonus} to hit, ${damage}${damageType ? ` ${damageType}` : ""}`
    : type === "save"
    ? ` — DC ${saveDc} ${saveAbility}`
    : "";

  const rechargeLabel = recharge ? ` (Recharge ${recharge})` : "";

  return (
    <div className="monster_action_item">
      {editMode ? (
        <div className="monster_action_edit">
          <div className="monster_action_edit_row">
            <input
              className="dnd5e_text_value monster_action_name_input"
              placeholder="Action name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => save()}
            />
            <select
              className="monster_action_type_select"
              value={type}
              onChange={(e) => { setType(e.target.value); save({ type: e.target.value }); }}
            >
              {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input
              className="dnd5e_text_value monster_action_recharge_input"
              placeholder="Recharge (e.g. 5-6)"
              value={recharge}
              onChange={(e) => setRecharge(e.target.value)}
              onBlur={() => save()}
            />
            <button className="dnd5e_remove_btn" onClick={() => removeItem(index)}>✕</button>
          </div>
          {type === "attack" && (
            <div className="monster_action_edit_row">
              <input className="dnd5e_text_value" placeholder="Attack bonus (e.g. +5)" value={attackBonus} onChange={(e) => setAtkBonus(e.target.value)} onBlur={() => save()} />
              <input className="dnd5e_text_value" placeholder="Damage (e.g. 2d6+3)" value={damage} onChange={(e) => setDamage(e.target.value)} onBlur={() => save()} />
              <input className="dnd5e_text_value" placeholder="Type" value={damageType} onChange={(e) => setDmgType(e.target.value)} onBlur={() => save()} />
              <input className="dnd5e_text_value" placeholder="Reach" value={reach} onChange={(e) => setReach(e.target.value)} onBlur={() => save()} />
              <input className="dnd5e_text_value" placeholder="Range" value={range} onChange={(e) => setRange(e.target.value)} onBlur={() => save()} />
            </div>
          )}
          {type === "save" && (
            <div className="monster_action_edit_row">
              <input className="dnd5e_text_value" placeholder="Save DC" value={saveDc} onChange={(e) => setSaveDc(e.target.value)} onBlur={() => save()} />
              <input className="dnd5e_text_value" placeholder="Save ability (e.g. DEX)" value={saveAbility} onChange={(e) => setSaveAbi(e.target.value)} onBlur={() => save()} />
              <input className="dnd5e_text_value" placeholder="Damage/effect" value={damage} onChange={(e) => setDamage(e.target.value)} onBlur={() => save()} />
              <input className="dnd5e_text_value" placeholder="Damage type" value={damageType} onChange={(e) => setDmgType(e.target.value)} onBlur={() => save()} />
            </div>
          )}
          <textarea
            className="monster_trait_desc_input"
            placeholder="Description…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onBlur={() => save()}
          />
        </div>
      ) : (
        <div className="monster_action_view">
          <div className="monster_action_view_header" onClick={() => setExpanded((v) => !v)}>
            <span className="monster_trait_view_name">{name}{rechargeLabel}.</span>
            <span className="monster_action_view_summary">{titleSuffix}</span>
            {desc && <span className="monster_action_expand_icon">{expanded ? "▾" : "▸"}</span>}
            <button
              className="dnd5e_use_btn monster_action_roll_btn"
              onClick={(e) => { e.stopPropagation(); fireAction(); }}
              title="Roll action"
            >
              Roll
            </button>
          </div>
          {expanded && desc && (
            <div className="monster_action_view_desc">{desc}</div>
          )}
        </div>
      )}
    </div>
  );
};

export const ActionsPanel = ({ Api }) => {
  const [actions, , addAction, removeAction, updateAction] = usePropertyList([Api, "actions", true]);
  const [editMode, setEditMode] = React.useState(false);

  return (
    <div className="dnd-panel">
      <div className="dnd-panel-title monster_panel_title_row">
        <span>Actions</span>
        <div className="monster_panel_toolbar">
          <button className="dnd5e_inventory_add_btn" onClick={() => { addAction(blankAction()); setEditMode(true); }}>+</button>
          <button
            className={`dnd5e_inventory_edit_btn${editMode ? " active" : ""}`}
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "✓ Done" : "Edit"}
          </button>
        </div>
      </div>
      {actions.length === 0 && (
        <div className="dnd5e_inventory_empty">No actions yet.</div>
      )}
      {actions.map((action, i) => (
        <ActionItem
          key={action.id ?? i}
          item={action}
          index={i}
          editMode={editMode}
          updateItem={updateAction}
          removeItem={removeAction}
          Api={Api}
        />
      ))}
    </div>
  );
};
