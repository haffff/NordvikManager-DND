import React from "react";
import { useProperty } from "../../hooks/useProperty";

const DefenseRow = ({ label, propertyName, Api, placeholder }) => {
  const [value, setValue] = useProperty([Api, propertyName, ""]);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => { setDraft(value ?? ""); }, [value]);

  return (
    <div className="monster_defense_row">
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

export const DefensesPanel = ({ Api }) => (
  <div className="dnd-panel">
    <div className="dnd-panel-title">Defenses</div>
    <DefenseRow label="Vulnerabilities"    propertyName="vulnerabilities"       Api={Api} placeholder="fire, radiant" />
    <DefenseRow label="Resistances"        propertyName="resistances"           Api={Api} placeholder="cold; bludgeoning from nonmagical attacks" />
    <DefenseRow label="Immunities"         propertyName="immunities"            Api={Api} placeholder="poison, psychic" />
    <DefenseRow label="Condition Immunities" propertyName="condition_immunities" Api={Api} placeholder="charmed, frightened" />
  </div>
);
