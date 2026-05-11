import React from "react";

export const useGlobalProperty = ([Api, propertyName, initValue, parentId]) => {
    const [property, setProperty] = React.useState(undefined);
  
    React.useEffect(() => {
      const onPropertyChange = ({ value }) => {
        setProperty(value);
      };

      const asyncSetup = async () => {
        Api.Properties.Global.Subscribe(parentId, propertyName, onPropertyChange);

        await Api.Properties.Global.Init(parentId, propertyName, initValue);
        const propertyValue = await Api.Properties.Global.Get(parentId, propertyName);
        if (propertyValue) {
          setProperty(propertyValue.value);
        }
      };
  
      asyncSetup();

      return () => {
        Api.Properties.Global.Unsubscribe(parentId, propertyName, onPropertyChange);
      };
    }, [propertyName]);

    const updateProperty = (value) => {
        Api.Properties.Global.Set(parentId, propertyName, value);
    }
  
    return [property, updateProperty];
}