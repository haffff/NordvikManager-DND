import React from "react";
import { useProperty } from "../../hooks/useProperty";

const StatBox = ({ label, propertyName, Api, initValue = 0, wide = false }) => {
  const [value, setValue] = useProperty([Api, propertyName, initValue]);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => { setDraft(value ?? ""); }, [value]);

  return (
    <div className={`dnd5e_attribute${wide ? " monster_stat_wide" : ""}`}>
      <div className="dnd5e_attribute_name">{label}</div>
      <input
        className="dnd5e_attribute_value"
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const n = parseInt(draft, 10);
          const v = isNaN(n) ? draft : n;
          setValue(v);
        }}
      />
    </div>
  );
};

const TextRow = ({ label, propertyName, Api, initValue = "", placeholder = "" }) => {
  const [value, setValue] = useProperty([Api, propertyName, initValue]);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => { setDraft(value ?? ""); }, [value]);

  return (
    <div className="monster_text_row">
      <span className="monster_text_label">{label}</span>
      <input
        className="monster_text_input dnd5e_text_value"
        type="text"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (draft !== (value ?? "")) setValue(draft); }}
      />
    </div>
  );
};

export const CombatStats = ({ Api }) => (
  <div className="dnd-panel monster_combat_panel">
    <div className="dnd-panel-title">Combat</div>
    <div className="monster_combat_stats_row">
      <StatBox label="AC"    propertyName="armor"  Api={Api} />
      <StatBox label="HP"    propertyName="hp"     Api={Api} />
      <StatBox label="Max HP"propertyName="maxhp"  Api={Api} />
      <StatBox label="Speed" propertyName="speed"  Api={Api} wide />
    </div>
    <TextRow label="Senses"    propertyName="senses"            Api={Api} placeholder="darkvision 60 ft., passive Perception 12" />
    <TextRow label="Languages" propertyName="languages"         Api={Api} placeholder="Common, Draconic" />
    <TextRow label="Saves"     propertyName="saving_throws"     Api={Api} placeholder="STR +4, CON +6" />
    <TextRow label="Skills"    propertyName="skills_text"       Api={Api} placeholder="Perception +5, Stealth +3" />
  </div>
);
