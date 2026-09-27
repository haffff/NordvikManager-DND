import React from "react";
import { useProperty } from "../../hooks/useProperty";

export const CharName5E = ({ Api }) => {
  const [name, setName] = useProperty([Api, "character_name", ""]);
  const [inputValue, setInputValue] = React.useState(name ?? "");

  React.useEffect(() => {
    setInputValue(name ?? "");
  }, [name]);

  return (
    <div className="dnd5e_characterName_container">
      <input
        className="dnd5e_text_value"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => {
          if (inputValue !== (name ?? "")) setName(inputValue);
        }}
      />
      <div className="dnd5e_text_name">Character Name</div>
    </div>
  );
};
