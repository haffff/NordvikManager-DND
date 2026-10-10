// The palette icons (tokenIcons.js COUNTER_ICONS) as components for the sheet. Imported by
// name, so only these 16 end up in the card bundle, not the whole icon pack.
import {
  GiAngryEyes, GiFlame, GiShield, GiLightningTrio, GiDeathSkull, GiHearts, GiEyeball, GiMoon, GiSun, GiBroadsword, GiFist, GiHolySymbol, GiMusicalNotes, GiOakLeaf, GiSandsOfTime, GiSparkles,
} from "react-icons/gi";
import { createElement } from "react";
import { COUNTER_ICONS } from "./tokenIcons.js";

const BY_NAME = { GiAngryEyes, GiFlame, GiShield, GiLightningTrio, GiDeathSkull, GiHearts, GiEyeball, GiMoon, GiSun, GiBroadsword, GiFist, GiHolySymbol, GiMusicalNotes, GiOakLeaf, GiSandsOfTime, GiSparkles };

/** The icon component of a palette key (undefined for none). */
export const counterIconComponent = (key) => BY_NAME[COUNTER_ICONS.find((i) => i.key === key)?.iconName];

/** The rendered icon of a palette key, or null for none. */
export const counterIcon = (key) => {
  const component = counterIconComponent(key);
  return component ? createElement(component) : null;
};
