import { Attribute5E } from "./Attribute5E";

export const AttributesContainer = ({ attributesList, Api }) => (
  <div className="dnd5e_attribute_container">
    <div className="dnd-panel-title" style={{ width: "100%", textAlign: "center" }}>
      Ability Scores
    </div>
    {attributesList.map((attr) => (
      <Attribute5E
        key={attr.attribute}
        attribute={attr.attribute}
        initAttribute={attr.initAttribute}
        initModifier={attr.initModifier}
        Api={Api}
        icon={attr.icon}
      />
    ))}
  </div>
);
