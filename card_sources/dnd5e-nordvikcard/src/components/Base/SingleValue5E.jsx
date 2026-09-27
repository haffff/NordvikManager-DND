import React from "react";
import { useProperty } from "../../../hooks/useProperty";

// A single numeric card property with a label, optionally with a roll link.
export const SingleValue5E = ({ propertyName, label, Api, customclass, readonly, rollLabel, rollOnClick }) => {
  const [value, setValue] = useProperty([Api, propertyName, 0]);
  const [inputValue, setInputValue] = React.useState(0);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className={customclass || "dnd5e_attribute"} style={{ justifyContent: "center", alignItems: "center" }}>
      <div className="dnd5e_attribute_name">{label}</div>
      <input
        className="dnd5e_attribute_value"
        type="text"
        value={inputValue ?? ""}
        onChange={(e) => {
          if (!isNaN(e.target.value)) setInputValue(e.target.value);
        }}
        onBlur={() => {
          if (isNaN(inputValue) || inputValue === "") {
            setInputValue(value);
            return;
          }
          setValue(parseInt(inputValue));
        }}
      />
      {rollLabel && rollOnClick && (
        <div onClick={rollOnClick} className="dnd5e_listItem_name" style={{ textAlign: "center" }}>
          {rollLabel}
        </div>
      )}
    </div>
  );
};
