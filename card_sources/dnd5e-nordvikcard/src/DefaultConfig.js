// Seed value for the game-wide "dnd5e_config" property. The template settings
// card edits it afterwards (item/spell sources etc.).
export const DefaultConfig = {
  attributes: [
    { attribute: "strength", initAttribute: 10, initModifier: 0 },
    { attribute: "dexterity", initAttribute: 10, initModifier: 0 },
    { attribute: "constitution", initAttribute: 10, initModifier: 0 },
    { attribute: "intelligence", initAttribute: 10, initModifier: 0 },
    { attribute: "wisdom", initAttribute: 10, initModifier: 0 },
    { attribute: "charisma", initAttribute: 10, initModifier: 0 },
  ],
  skills: [
    { name: "Acrobatics", modifier: "dexterity" },
    { name: "Animal Handling", modifier: "wisdom" },
    { name: "Arcana", modifier: "intelligence" },
    { name: "Athletics", modifier: "strength" },
    { name: "Deception", modifier: "charisma" },
    { name: "History", modifier: "intelligence" },
    { name: "Insight", modifier: "wisdom" },
    { name: "Intimidation", modifier: "charisma" },
    { name: "Investigation", modifier: "intelligence" },
    { name: "Medicine", modifier: "wisdom" },
    { name: "Nature", modifier: "intelligence" },
    { name: "Perception", modifier: "wisdom" },
    { name: "Performance", modifier: "charisma" },
    { name: "Persuasion", modifier: "charisma" },
    { name: "Religion", modifier: "intelligence" },
    { name: "Sleight of Hand", modifier: "dexterity" },
    { name: "Stealth", modifier: "dexterity" },
    { name: "Survival", modifier: "wisdom" },
  ],
  spellSources: [],
};
