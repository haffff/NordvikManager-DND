import React from "react";

// One ability score. Keeps `{attribute}_mod` in sync with `{attribute}_attribute`.
export const Attribute5E = ({ attribute, initAttribute, initModifier, Api, icon }) => {
  const [value, setValue] = React.useState(0);
  const [modifier, setModifier] = React.useState(0);
  const [inputValue, setInputValue] = React.useState(0);

  const attributeProperty = `${attribute}_attribute`;
  const modifierProperty = `${attribute}_mod`;

  React.useEffect(() => {
    const onAttributeChange = ({ value }) => {
      setValue(value);
      setInputValue(value);
      const newModifier = Math.floor((Number(value) - 10) / 2);
      setModifier(newModifier);
      Api.Properties.Get(modifierProperty).then((mod) => {
        if (!mod || mod.value != newModifier) Api.Properties.Set(modifierProperty, newModifier);
      });
    };

    (async () => {
      Api.Properties.Subscribe(attributeProperty, onAttributeChange);
      await Api.Properties.Init(attributeProperty, initAttribute ?? 10);
      await Api.Properties.Init(modifierProperty, initModifier ?? 0);

      const attributeValue = await Api.Properties.Get(attributeProperty);
      const modifierValue = await Api.Properties.Get(modifierProperty);
      const calculated = Math.floor((Number(attributeValue.value) - 10) / 2);
      if (modifierValue.value != calculated) await Api.Properties.Set(modifierProperty, calculated);
      setModifier(calculated);
      setValue(attributeValue.value);
      setInputValue(attributeValue.value);
    })();

    return () => {
      Api.Properties.Unsubscribe(attributeProperty, onAttributeChange);
    };
  }, []);

  return (
    <div className="dnd5e_attribute">
      <div
        className="dnd5e_attribute_name"
        onClick={() => {
          Api.FireAction("dnd5e/roll_attribute", { attribute });
        }}
      >
        {attribute}
      </div>
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
          Api.Properties.Set(attributeProperty, parseInt(inputValue));
        }}
      />
      <div className="dnd5e_attribute_modifier">{modifier >= 0 ? `+${modifier}` : modifier}</div>
    </div>
  );
};
