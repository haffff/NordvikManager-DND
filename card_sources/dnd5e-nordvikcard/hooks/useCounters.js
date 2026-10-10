import React from "react";
import { useProperty } from "./useProperty";
import { COUNTERS_PROPERTY, parseCounters } from "../src/counters.js";
import { changedIconProps } from "../src/tokenIcons.js";

/**
 * The character's counters, and `apply(fn)` to change them: fn gets the list and
 * returns the new one (src/counters.js). Saves the list and the token's counter icon
 * properties that changed with it (src/tokenIcons.js), so the token follows the sheet.
 */
export const useCounters = (Api) => {
  const [stored, setStored] = useProperty([Api, COUNTERS_PROPERTY, "[]"]);
  const counters = React.useMemo(() => parseCounters(stored), [stored]);

  const apply = (fn) => {
    const next = fn(counters);
    setStored(JSON.stringify(next));
    for (const [name, value] of Object.entries(changedIconProps(counters, next))) {
      Api.Properties.Set(name, value);
    }
    return next;
  };

  return [counters, apply];
};
