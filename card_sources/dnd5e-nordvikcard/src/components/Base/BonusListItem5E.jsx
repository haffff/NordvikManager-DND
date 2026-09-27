import React from "react";
import { useProperty } from "../../../hooks/useProperty";

// A saving throw / skill row: proficiency checkbox, computed bonus, clickable name.
// The bonus is `{modifier}` plus `proficiency_bonus` when proficient, and is
// written back to the `{name}` property.
export const BonusListItem5E = ({ name, Api, modifier, onCalculation, onNameClick }) => {
  const [value, setValue] = useProperty([Api, name, 0]);
  const [proficiency, setProficiency] = useProperty([Api, name + "_proficiency", false]);
  const [modifierValue] = useProperty([Api, modifier, 0]);
  const [proficiencyBonus] = useProperty([Api, "proficiency_bonus", 0]);

  const isProficient =
    proficiency === true || (typeof proficiency === "string" && proficiency.toLowerCase() === "true");

  React.useEffect(() => {
    if (modifierValue === undefined || proficiencyBonus === undefined) return;
    const calculated = isProficient
      ? parseInt(modifierValue) + parseInt(proficiencyBonus)
      : parseInt(modifierValue);
    if (onCalculation) onCalculation(name, calculated);
    if (Number(value) !== calculated) setValue(calculated);
  }, [proficiencyBonus, proficiency, modifierValue]);

  return (
    <div className="dnd5e_listItem">
      <div className="dnd5e_listItem_prof">
        <input type="checkbox" checked={isProficient} onChange={(e) => setProficiency(e.target.checked)} />
      </div>
      <div className="dnd5e_listItem_value">{value >= 0 ? `+${value}` : value}</div>
      <div
        className="dnd5e_listItem_name"
        onClick={() => {
          if (onNameClick) onNameClick(name);
        }}
      >
        {name.split("_").join(" ")}
      </div>
    </div>
  );
};
