import React from "react";
import { useProperty } from "../../hooks/useProperty";

// Derives `proficiency_bonus` from `character_level` (2 at level 1, +1 every 4 levels).
export const ProficencyBonus5E = ({ Api }) => {
  const [bonus, setBonus] = useProperty([Api, "proficiency_bonus", 0]);
  const [level] = useProperty([Api, "character_level", 1]);

  React.useEffect(() => {
    if (level) {
      const calculated = Math.floor((parseInt(level) - 1) / 4) + 2;
      if (Number(bonus) !== calculated) setBonus(calculated);
    }
  }, [level]);

  return (
    <div className="dnd5e_attribute" style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="dnd5e_attribute_name">Prof. Bonus</div>
      <div className="dnd5e_attribute_value" style={{ lineHeight: "1.1", padding: "4px 0" }}>
        +{bonus}
      </div>
    </div>
  );
};
