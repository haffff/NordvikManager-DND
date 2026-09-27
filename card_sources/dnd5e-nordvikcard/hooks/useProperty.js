import React from "react";

export const useProperty = ([Api, propertyName, initValue]) => {
    const [property, setProperty] = React.useState(undefined);
  
    React.useEffect(() => {
      const onPropertyChange = ({ value }) => {
        setProperty(value);
      };

      const asyncSetup = async () => {
        Api.Properties.Subscribe(propertyName, onPropertyChange);

        await Api.Properties.Init(propertyName, initValue);

        const propertyValue = await Api.Properties.Get(propertyName);
        if (propertyValue) {
          setProperty(propertyValue.value);
        }
      };
  
      asyncSetup();

      return () => {
        Api.Properties.Unsubscribe(propertyName, onPropertyChange);
      };
    }, [propertyName]);

    const updateProperty = (value) => {
        Api.Properties.Set(propertyName, value);
    }
  
    return [property, updateProperty];
}