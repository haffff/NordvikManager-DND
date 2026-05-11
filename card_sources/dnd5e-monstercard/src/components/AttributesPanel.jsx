import React from "react";
import { useProperty } from "../../hooks/useProperty";

const DEFAULT_ATTRIBUTES = [
  { attribute: "strength",     initAttribute: 10, initModifier: 0 },
  { attribute: "dexterity",    initAttribute: 10, initModifier: 0 },
  { attribute: "constitution", initAttribute: 10, initModifier: 0 },
  { attribute: "intelligence", initAttribute: 10, initModifier: 0 },
  { attribute: "wisdom",       initAttribute: 10, initModifier: 0 },
  { attribute: "charisma",     initAttribute: 10, initModifier: 0 },
];

const AttributeBox = ({ attribute, initAttribute, initModifier, Api }) => {
  const attributeName = `${attribute}_attribute`;
  const modifierName  = `${attribute}_mod`;

  const [attrValue, setAttrValue] = useProperty([Api, attributeName, initAttribute ?? 10]);
  const [, setModValue] = useProperty([Api, modifierName, initModifier ?? 0]);
  const [draft, setDraft] = React.useState("");

  React.useEffect(() => { setDraft(attrValue ?? ""); }, [attrValue]);

  const computedMod = Math.floor((Number(attrValue ?? 10) - 10) / 2);
  const modLabel = computedMod >= 0 ? `+${computedMod}` : String(computedMod);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (isNaN(n)) { setDraft(attrValue ?? ""); return; }
    setAttrValue(n);
    setModValue(Math.floor((n - 10) / 2));
  };

  return (
    <div className="dnd5e_attribute">
      <div
        className="dnd5e_attribute_name"
        onClick={() => Api.FireAction("dnd5e.roll_attribute", { attribute })}
      >
        {attribute.slice(0, 3).toUpperCase()}
      </div>
      <input
        className="dnd5e_attribute_value"
        type="text"
        value={draft}
        onChange={(e) => { if (!isNaN(e.target.value)) setDraft(e.target.value); }}
        onBlur={commit}
      />
      <div className="dnd5e_attribute_modifier">{modLabel}</div>
    </div>
  );
};

export const AttributesPanel = ({ Api, config }) => {
  const attributes = config?.attributes?.length ? config.attributes : DEFAULT_ATTRIBUTES;

  return (
    <div className="dnd5e_attribute_container">
      <div className="dnd-panel-title" style={{ width: "100%", textAlign: "center" }}>Ability Scores</div>
      {attributes.map((attr) => (
        <AttributeBox
          key={attr.attribute}
          attribute={attr.attribute}
          initAttribute={attr.initAttribute}
          initModifier={attr.initModifier}
          Api={Api}
        />
      ))}
    </div>
  );
};
