// The palette icons (tokenIcons.js COUNTER_ICONS) as components for the sheet. Imported by
// name, so only these end up in the card bundle, not the whole icon pack.
import { createElement } from "react";
import {
  GiAngryEyes, GiFlame, GiShield, GiLightningTrio, GiDeathSkull, GiHearts, GiEyeball, GiMoon, GiSun, GiBroadsword,
  GiFist, GiHolySymbol, GiMusicalNotes, GiOakLeaf, GiSandsOfTime, GiSparkles, GiPlainCircle,
} from "react-icons/gi";
import { COUNTER_ICONS } from "./tokenIcons.js";

const BY_NAME = {
  GiAngryEyes, GiFlame, GiShield, GiLightningTrio, GiDeathSkull, GiHearts, GiEyeball, GiMoon, GiSun, GiBroadsword,
  GiFist, GiHolySymbol, GiMusicalNotes, GiOakLeaf, GiSandsOfTime, GiSparkles, GiPlainCircle,
};

const iconFor = (key) => COUNTER_ICONS.find((i) => i.key === key);

/** The icon component of a palette key (undefined for none). */
export const counterIconComponent = (key) => BY_NAME[iconFor(key)?.iconName];

/** The rendered icon of a palette key (in its own colour, for the status dots), or null for none. */
export const counterIcon = (key) => {
  const component = counterIconComponent(key);
  const fill = iconFor(key)?.fill;
  return component ? createElement(component, fill ? { style: { color: fill } } : undefined) : null;
};
