import React from "react";

export const usePropertyList = ([Api, propertyName, json=false]) => {
  const [properties, setProperties] = React.useState(undefined);
  const [propCount, setPropCount] = React.useState(0);

  const propCountName = propertyName + "_count";
  const propCountValue = propCount?.value ? parseInt(propCount?.value) : 0;

  const values = React.useMemo(() => {
    if (properties) {
      if (json) {
        return properties.map((x) => JSON.parse(x.value));
      }
      return properties.map((x) => x.value);
    }
    return [];
  }, [properties]);
  React.useEffect(() => {
    const asyncSetup = async () => {
      async function LoadProperties() {
        const newPropCount = await Api.Properties.Get(propCountName);
        const newPropCountValue = parseInt(newPropCount?.value);

        setPropCount(newPropCount);

        let names = [];
        for (let index = 0; index < newPropCountValue; index++) {
          names.push(propertyName + "_" + index);
        }

        let props = await Api.Properties.GetMany(names);
        setProperties(props);
      }

      const onNotify = async () => {
        await LoadProperties();
      };

      Api.Properties.Subscribe(propertyName + "_notify", onNotify);

      await Api.Properties.Init(propCountName, 0);

      await LoadProperties();

      return () => {
        Api.Properties.Unsubscribe(propertyName + "_notify", onNotify);
      };
    };

    const cleanup = asyncSetup();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [propertyName]);

  const add = async (value) => {
    const newPropCountValue = propCountValue + 1;
    await Api.Properties.Set(propCountName, newPropCountValue);
    await Api.Properties.Set(propertyName + "_" + (newPropCountValue - 1), json ? JSON.stringify(value) : value);
    await Api.Properties.Set(propertyName + "_notify", Date.now());
  };

  const remove = async (index) => {
    await Api.Properties.Remove(propertyName + "_" + index);
    await Api.Properties.Set(propCountName, propCountValue - 1);

    // Shift all properties down
    for (let i = index + 1; i < propCountValue; i++) {
      const value = await Api.Properties.Get(propertyName + "_" + i);
      await Api.Properties.Set(propertyName + "_" + (i - 1), value.value);
    }

    await Api.Properties.Set(propertyName + "_notify", Date.now());
  };

  const update = async (index, value) => {
    await Api.Properties.Set(propertyName + "_" + index, json ? JSON.stringify(value) : value);
    await Api.Properties.Set(propertyName + "_notify", Date.now());
  };

  return [values, propCount, add, remove, update];
};
