import { BonusListItem5E } from "./Base/BonusListItem5E";

export const Skills5E = ({ Api, skills }) => (
  <div className="dnd5e_saving_throws_container">
    <div className="dnd-panel-title">Skills</div>
    {skills.map((skill) => (
      <BonusListItem5E
        Api={Api}
        name={skill.name}
        modifier={skill.modifier + "_mod"}
        onNameClick={() => {
          Api.FireAction("dnd5e/roll_skill", { skill: skill.name });
        }}
      />
    ))}
  </div>
);
