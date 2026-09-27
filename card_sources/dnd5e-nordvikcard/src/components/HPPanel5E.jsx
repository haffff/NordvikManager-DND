import React from "react";
import { useProperty } from "../../hooks/useProperty";
import { SingleValue5E } from "./Base/SingleValue5E";

export const HPPanel5E = ({ Api }) => {
  const [hitDiceMax, setHitDiceMax] = useProperty([Api, "hitdicemax", 0]);
  const [level] = useProperty([Api, "character_level", 1]);

  // Total hit dice always equals character level.
  React.useEffect(() => {
    if (level) {
      const calculated = parseInt(level);
      if (Number(hitDiceMax) !== calculated) setHitDiceMax(calculated);
    }
  }, [level]);

  return (
    <div className="dnb5e_hppanel">
      <div className="dnd5e_health_bar">
        <div className="dnd-panel-title" style={{ width: "100%", textAlign: "center" }}>
          Hit Points
        </div>
        <SingleValue5E customclass="dnd5e_health_value" Api={Api} propertyName="hp" label="Current" />
        <SingleValue5E customclass="dnd5e_health_value" Api={Api} propertyName="maxhp" label="Maximum" />
      </div>
      <div className="dnd5e_health_bar">
        <div className="dnd-panel-title" style={{ width: "100%", textAlign: "center" }}>
          Temp HP
        </div>
        <SingleValue5E customclass="dnd5e_health_value" Api={Api} propertyName="temphp" label="Current" />
        <SingleValue5E customclass="dnd5e_health_value" Api={Api} propertyName="tempmaxhp" label="Maximum" />
      </div>
      <div className="dnd5e_health_bar">
        <div className="dnd-panel-title" style={{ width: "100%", textAlign: "center" }}>
          Hit Dice
        </div>
        <SingleValue5E
          customclass="dnd5e_health_value"
          Api={Api}
          propertyName="hitdice"
          rollLabel="Roll"
          rollOnClick={() => {}}
          label="Used"
        />
        <SingleValue5E customclass="dnd5e_health_value" Api={Api} propertyName="hitdicemax" label="Total" />
      </div>
    </div>
  );
};
