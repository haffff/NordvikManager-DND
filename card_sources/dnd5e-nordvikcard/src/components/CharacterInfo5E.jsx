import React from "react";
import { useProperty } from "../../hooks/useProperty";

const CharacterInfoField = ({ label, value, setValue, style, inputStyle }) => {
  const [inputValue, setInputValue] = React.useState(value ?? "");

  React.useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  return (
    <div className="dnd5e_characterInfo_container" style={style}>
      <input
        className="dnd5e_text_value"
        type="text"
        style={inputStyle}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => {
          if (inputValue !== (value ?? "")) setValue(inputValue);
        }}
      />
      <div className="dnd5e_text_name">{label}</div>
    </div>
  );
};

export const CharacterInfo5E = ({ Api }) => {
  const [characterClass, setCharacterClass] = useProperty([Api, "character_class", ""]);
  const [level, setLevel] = useProperty([Api, "character_level", ""]);
  const [background, setBackground] = useProperty([Api, "character_background", ""]);
  const [race, setRace] = useProperty([Api, "character_race", ""]);
  const [alignment, setAlignment] = useProperty([Api, "character_alignment", ""]);
  const [experience, setExperience] = useProperty([Api, "character_experience_points", ""]);
  const [playerName, setPlayerName] = useProperty([Api, "player_name", ""]);

  return (
    <div className="dnd5e_characterInfo_main_container">
      <div className="dnd-panel-title">Character Info</div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <CharacterInfoField
          label="Class"
          value={characterClass}
          setValue={setCharacterClass}
          style={{ width: "140px" }}
          inputStyle={{ width: "140px" }}
        />
        <CharacterInfoField
          label="Level"
          value={level}
          setValue={setLevel}
          style={{ width: "50px" }}
          inputStyle={{ width: "50px" }}
        />
        <CharacterInfoField label="Background" value={background} setValue={setBackground} />
        <CharacterInfoField label="Player Name" value={playerName} setValue={setPlayerName} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <CharacterInfoField label="Race" value={race} setValue={setRace} />
        <CharacterInfoField label="Alignment" value={alignment} setValue={setAlignment} />
        <CharacterInfoField label="Experience Points" value={experience} setValue={setExperience} />
      </div>
    </div>
  );
};
