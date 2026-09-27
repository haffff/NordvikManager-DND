import { BonusListItem5E } from "./Base/BonusListItem5E";

export const SavingThrows5E = ({ Api, attributesList }) => (
  <div className="dnd5e_saving_throws_container">
    <div className="dnd-panel-title">Saving Throws</div>
    {attributesList.map((attr) => (
      <BonusListItem5E
        Api={Api}
        name={attr.attribute + "_save"}
        modifier={attr.attribute + "_mod"}
        onNameClick={() => {
          Api.FireAction("dnd5e/roll_saving_throw", { attribute: attr.attribute });
        }}
      />
    ))}
  </div>
);
