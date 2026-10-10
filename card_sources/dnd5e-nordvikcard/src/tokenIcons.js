// Icons on the character's token (addon_files/Resources/token_*.json, built by
// scripts/tokens). Token parts are fixed when a token is placed and can only be shown
// or hidden by card properties, so each palette icon has its own part, shown while its
// "dnd5e_icon_<key>" property is "true". The sheet and the Turn Changed action write
// those properties from the counters (tokenIconProps).

/** Icons a counter can show on the token (react-icons/gi, the token icon pack). Changing
 * this list: run `pnpm tokens:build` (token parts and the Turn Changed action's steps). */
export const COUNTER_ICONS = [
  { key: "rage", label: "Rage", iconName: "GiAngryEyes" },
  { key: "flame", label: "Flame", iconName: "GiFlame" },
  { key: "shield", label: "Shield", iconName: "GiShield" },
  { key: "bolt", label: "Lightning", iconName: "GiLightningTrio" },
  { key: "skull", label: "Skull", iconName: "GiDeathSkull" },
  { key: "heart", label: "Heart", iconName: "GiHearts" },
  { key: "eye", label: "Eye", iconName: "GiEyeball" },
  { key: "moon", label: "Moon", iconName: "GiMoon" },
  { key: "sun", label: "Sun", iconName: "GiSun" },
  { key: "sword", label: "Sword", iconName: "GiBroadsword" },
  { key: "fist", label: "Fist", iconName: "GiFist" },
  { key: "holy", label: "Holy symbol", iconName: "GiHolySymbol" },
  { key: "music", label: "Music", iconName: "GiMusicalNotes" },
  { key: "leaf", label: "Leaf", iconName: "GiOakLeaf" },
  { key: "hourglass", label: "Hourglass", iconName: "GiSandsOfTime" },
  { key: "sparkles", label: "Sparkles", iconName: "GiSparkles" },
  // Plain coloured dots, for anything the themed icons don't fit (fill: their colour).
  { key: "dot_yellow", label: "Status: yellow", iconName: "GiPlainCircle", fill: "rgba(240,200,40,0.95)" },
  { key: "dot_red", label: "Status: red", iconName: "GiPlainCircle", fill: "rgba(210,50,50,0.95)" },
  { key: "dot_blue", label: "Status: blue", iconName: "GiPlainCircle", fill: "rgba(60,130,230,0.95)" },
  { key: "dot_green", label: "Status: green", iconName: "GiPlainCircle", fill: "rgba(60,170,80,0.95)" },
];

/** SRD conditions (and Concentration), toggled from the token's icon picker. */
export const CONDITIONS = [
  ["blinded", "Blinded", "GiBlindfold"],
  ["charmed", "Charmed", "GiCharm"],
  ["deafened", "Deafened", "GiHumanEar"],
  ["exhaustion", "Exhaustion", "GiTiredEye"],
  ["frightened", "Frightened", "GiScreaming"],
  ["grappled", "Grappled", "GiGrab"],
  ["incapacitated", "Incapacitated", "GiKnockout"],
  ["invisible", "Invisible", "GiInvisible"],
  ["paralyzed", "Paralyzed", "GiFrozenBody"],
  ["petrified", "Petrified", "GiStoneBust"],
  ["poisoned", "Poisoned", "GiPoisonBottle"],
  ["prone", "Prone", "GiFalling"],
  ["restrained", "Restrained", "GiCrossedChains"],
  ["stunned", "Stunned", "GiKnockedOutStars"],
  ["unconscious", "Unconscious", "GiSleepy"],
  ["concentration", "Concentration", "GiConcentrationOrb"],
].map(([id, label, iconName]) => ({ id, label, iconName, dtoProperty: `status_${id}` }));

/** When a counter shows its icon. */
export const SHOW_ON_TOKEN = { active: "While active", uses: "While it has uses", never: "Never" };

export const iconProperty = (key) => `dnd5e_icon_${key}`;

/** A counter's icon settings; counters made before icons existed show nothing. */
export const iconOf = (counter) => ({ icon: counter.icon ?? "", showOnToken: counter.showOnToken ?? "never" });

const isOn = (counter) => {
  const { showOnToken } = iconOf(counter);
  if (showOnToken === "active") return counter.roundsLeft > 0;
  if (showOnToken === "uses") return (counter.current ?? 0) > 0;
  return false;
};

/** Every palette icon's property: "true" while a counter using that icon is on. */
export const tokenIconProps = (counters) => {
  const on = new Set(counters.filter((c) => iconOf(c).icon && isOn(c)).map((c) => c.icon));
  return Object.fromEntries(COUNTER_ICONS.map(({ key }) => [iconProperty(key), on.has(key) ? "true" : "false"]));
};

/** Only the icon properties that differ between two versions of the counters. */
export const changedIconProps = (before, after) => {
  const was = tokenIconProps(before);
  return Object.fromEntries(Object.entries(tokenIconProps(after)).filter(([name, value]) => was[name] !== value));
};
