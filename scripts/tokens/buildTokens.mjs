// Builds the addon's token definitions (addon_files/Resources/token_*.json) from the
// character token's base parts (image, HP bar, name label, open-card button), adding a
// part per counter icon and per SRD condition. Token parts are fixed when a token is
// placed and can only be shown or hidden by card properties, so every icon a token may
// show is its own hidden part (see card_sources/dnd5e-nordvikcard/src/tokenIcons.js).
import { COUNTER_ICONS, CONDITIONS, iconProperty } from "../../card_sources/dnd5e-nordvikcard/src/tokenIcons.js";

const COUNTER_PREFIX = "counter_icon_";
const CONDITION_PREFIX = "status_";
const COUNTER_FILL = "rgba(232,184,75,0.95)";
const CONDITION_FILL = {
  blinded: "rgba(90,90,90,0.95)", charmed: "rgba(230,110,170,0.95)", deafened: "rgba(150,150,150,0.95)",
  exhaustion: "rgba(170,120,60,0.95)", frightened: "rgba(200,60,60,0.95)", grappled: "rgba(190,140,70,0.95)",
  incapacitated: "rgba(120,120,160,0.95)", invisible: "rgba(160,200,230,0.95)", paralyzed: "rgba(120,190,230,0.95)",
  petrified: "rgba(140,130,120,0.95)", poisoned: "rgba(140,200,60,0.95)", prone: "rgba(180,130,80,0.95)",
  restrained: "rgba(110,110,110,0.95)", stunned: "rgba(240,210,70,0.95)", unconscious: "rgba(90,90,140,0.95)",
  concentration: "rgba(120,170,255,0.95)",
};

/** The parts of a token that aren't generated here. */
export const baseAdditions = (token) =>
  (token.additions ?? []).filter((a) => !a.name?.startsWith(COUNTER_PREFIX) && !a.name?.startsWith(CONDITION_PREFIX));

// A small status icon at the token's top right, shown while `property` is true.
const iconPart = ({ name, iconName, fill, property, maskGroup, label }) => ({
  name,
  type: "reactIcon",
  iconPack: "gi",
  iconName,
  left: 0,
  top: 0,
  width: 18,
  height: 18,
  originX: "center",
  originY: "top",
  fill,
  scaleX: 1,
  scaleY: 1,
  angle: 0,
  opacity: 1,
  visible: false,
  tokenData: {
    anchor: "right-top",
    offsetX: 0,
    offsetY: 0,
    maskGroup,
    label,
    propDeps: [{ dtoProperty: property, objectProperty: "visible", type: "bool", source: "card" }],
  },
});

const NAME_PROPERTY = { character: "character_name", monster: "monster_name" };

/** The token for a kind of card ("character" or "monster"), built on `base`'s parts. */
export const buildToken = (base, kind) => {
  const parts = baseAdditions(base).map((a) => {
    if (a.name !== "name_label") return a;
    const [dep, ...rest] = a.tokenData.propDeps;
    return { ...a, tokenData: { ...a.tokenData, propDeps: [{ ...dep, dtoProperty: NAME_PROPERTY[kind] }, ...rest] } };
  });

  return {
    ...base,
    assignableIcons: CONDITIONS.map(({ id, label, iconName, dtoProperty }) => ({
      id, label, iconPack: "gi", iconName, dtoProperty, source: "card",
    })),
    additions: [
      ...parts,
      ...COUNTER_ICONS.map(({ key, iconName }) => iconPart({
        name: `${COUNTER_PREFIX}${key}`, iconName, fill: COUNTER_FILL, property: iconProperty(key),
        maskGroup: "counters", label: "Counter icons",
      })),
      ...CONDITIONS.map(({ id, iconName, dtoProperty }) => iconPart({
        name: `${CONDITION_PREFIX}${id}`, iconName, fill: CONDITION_FILL[id], property: dtoProperty,
        maskGroup: "conditions", label: "Conditions",
      })),
    ],
  };
};
