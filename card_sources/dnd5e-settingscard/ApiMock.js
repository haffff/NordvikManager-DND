// ── ID helper ──────────────────────────────────────────────────────────────────
let _idCounter = 1;
const _mkId = () => `mock-prop-${_idCounter++}`;

// ── Dev seed: representative 5e SRD items ──────────────────────────────────────
// Stored under Resources key "5e_items" so ItemSearchPanel works out of the box
// in development without a server. Matches the 5etools items.json shape.
const MOCK_5E_ITEMS = { item: [
  { name:"Dagger", source:"PHB", type:"M", rarity:"none", weight:1, value:200, weaponCategory:"simple", dmg1:"1d4", dmgType:"P" },
  { name:"Longsword", source:"PHB", type:"M", rarity:"none", weight:3, value:1500, weaponCategory:"martial", dmg1:"1d8", dmgType:"S", dmg2:"1d10" },
  { name:"Shortsword", source:"PHB", type:"M", rarity:"none", weight:2, value:1000, weaponCategory:"martial", dmg1:"1d6", dmgType:"P" },
  { name:"Greatsword", source:"PHB", type:"M", rarity:"none", weight:6, value:5000, weaponCategory:"martial", dmg1:"2d6", dmgType:"S" },
  { name:"Handaxe", source:"PHB", type:"M", rarity:"none", weight:2, value:500, weaponCategory:"simple", dmg1:"1d6", dmgType:"S" },
  { name:"Quarterstaff", source:"PHB", type:"M", rarity:"none", weight:4, value:20, weaponCategory:"simple", dmg1:"1d6", dmgType:"B", dmg2:"1d8" },
  { name:"Longbow", source:"PHB", type:"R", rarity:"none", weight:2, value:5000, weaponCategory:"martial", dmg1:"1d8", dmgType:"P" },
  { name:"Shortbow", source:"PHB", type:"R", rarity:"none", weight:2, value:2500, weaponCategory:"simple", dmg1:"1d6", dmgType:"P" },
  { name:"Hand Crossbow", source:"PHB", type:"R", rarity:"none", weight:3, value:7500, weaponCategory:"martial", dmg1:"1d6", dmgType:"P" },
  { name:"Leather Armor", source:"PHB", type:"LA", rarity:"none", weight:10, value:1000, entries:["The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil. The rest of the armor is made of softer and more flexible materials."] },
  { name:"Chain Mail", source:"PHB", type:"HA", rarity:"none", weight:55, value:7500, entries:["Made of interlocking metal rings, chain mail includes a layer of quilted fabric worn underneath the mail to prevent chafing and to cushion the impact of blows. The suit includes gauntlets."] },
  { name:"Plate Armor", source:"PHB", type:"HA", rarity:"none", weight:65, value:150000, entries:["Plate consists of shaped, interlocking metal plates to cover the entire body. A suit of plate includes gauntlets, heavy leather boots, a visored helmet, and thick layers of padding underneath the armor. Buckles and straps distribute the weight over the body."] },
  { name:"Shield", source:"PHB", type:"S", rarity:"none", weight:6, value:1000, entries:["A shield is made from wood or metal and is carried in one hand. Wielding a shield increases your Armor Class by 2. You can benefit from only one shield at a time."] },
  { name:"Backpack", source:"PHB", type:"G", rarity:"none", weight:5, value:200, entries:["A backpack can hold one cubic foot or 30 pounds of gear. You can also strap items, such as a bedroll or a coil of rope, to the outside of a backpack."] },
  { name:"Torch", source:"PHB", type:"G", rarity:"none", weight:1, value:1, entries:["A torch burns for 1 hour, providing bright light in a 20-foot radius and dim light for an additional 20 feet. If you make a melee attack with a burning torch and hit, it deals 1 fire damage."] },
  { name:"Bedroll", source:"PHB", type:"G", rarity:"none", weight:7, value:100 },
  { name:"Thieves' Tools", source:"PHB", type:"T", rarity:"none", weight:1, value:2500, entries:["This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers. Proficiency with these tools lets you add your proficiency bonus to any ability checks you make to disarm traps or open locks."] },
  { name:"Healer's Kit", source:"PHB", type:"G", rarity:"none", weight:3, value:500, entries:["This kit is a leather pouch containing bandages, salves, and splints. The kit has ten uses. As an action, you can expend one use of the kit to stabilize a creature that has 0 hit points, without needing to make a Wisdom check."] },
  { name:"Tinderbox", source:"PHB", type:"G", rarity:"none", weight:1, value:50, entries:["This small container holds flint, fire steel, and tinder used to kindle a fire. Using it to light a torch takes an action. Lighting any other fire takes 1 minute."] },
  { name:"Potion of Healing", source:"DMG", type:"P", rarity:"common", weight:0.5, value:5000, entries:["You regain 2d4 + 2 hit points when you drink this potion. The potion's red liquid glimmers when agitated."] },
  { name:"Bag of Holding", source:"DMG", rarity:"uncommon", wondrous:true, weight:15, entries:["This bag has an interior space considerably larger than its outside dimensions, roughly 2 feet in diameter at the mouth and 4 feet deep. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. The bag weighs 15 pounds, regardless of its contents. Retrieving an item from the bag requires an action."] },
  { name:"Cloak of Protection", source:"DMG", rarity:"uncommon", reqAttune:true, wondrous:true, entries:["You gain a +1 bonus to AC and saving throws while you wear this cloak."] },
  { name:"+1 Longsword", source:"DMG", type:"M", rarity:"uncommon", reqAttune:true, weight:3, value:100000, weaponCategory:"martial", dmg1:"1d8", dmgType:"S", dmg2:"1d10", entries:["You have a +1 bonus to attack and damage rolls made with this magic weapon."] },
] };

// ── Dev seed: 5e SRD spells (PHB subset) ─────────────────────────────────────
const MOCK_5E_SPELLS_PHB = { spell: [
  {
    name: "Mage Armor", source: "PHB", level: 1, school: "A",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "touch" } },
    components: { v: true, s: true, m: "a piece of cured leather" },
    duration: [{ type: "timed", duration: { type: "hour", amount: 8 } }],
    entries: ["You touch a willing creature who isn't wearing armor, and a protective magical force surrounds it until the spell ends. The target's base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action."],
  },
  {
    name: "Shield", source: "PHB", level: 1, school: "A",
    time: [{ number: 1, unit: "reaction" }],
    range: { type: "point", distance: { type: "self" } },
    components: { v: true, s: true },
    duration: [{ type: "timed", duration: { type: "round", amount: 1 } }],
    entries: ["An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile."],
  },
  {
    name: "Magic Missile", source: "PHB", level: 1, school: "V",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "feet", amount: 120 } },
    components: { v: true, s: true },
    duration: [{ type: "instant" }],
    entries: ["You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals {@damage 1d4 + 1} force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several."],
    entriesHigherLevel: [{ type: "entries", name: "At Higher Levels", entries: ["When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st."] }],
  },
  {
    name: "Cure Wounds", source: "PHB", level: 1, school: "V",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "touch" } },
    components: { v: true, s: true },
    duration: [{ type: "instant" }],
    entries: ["A creature you touch regains a number of hit points equal to {@dice 1d8} + your spellcasting ability modifier. This spell has no effect on undead or constructs."],
    entriesHigherLevel: [{ type: "entries", name: "At Higher Levels", entries: ["When you cast this spell using a spell slot of 2nd level or higher, the healing increases by {@scaledice 1d8|1-9|1d8} for each slot level above 1st."] }],
  },
  {
    name: "Detect Magic", source: "PHB", level: 1, school: "D",
    meta: { ritual: true },
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "self" } },
    components: { v: true, s: true },
    duration: [{ type: "timed", duration: { type: "minute", amount: 10 }, concentration: true }],
    entries: ["For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any."],
  },
  {
    name: "Fireball", source: "PHB", level: 3, school: "V",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "feet", amount: 150 } },
    components: { v: true, s: true, m: "a tiny ball of bat guano and sulfur" },
    duration: [{ type: "instant" }],
    entries: ["A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes {@damage 8d6} fire damage on a failed save, or half as much damage on a successful one. The fire spreads around corners. It ignites flammable objects in the area that aren't being worn or carried."],
    entriesHigherLevel: [{ type: "entries", name: "At Higher Levels", entries: ["When you cast this spell using a spell slot of 4th level or higher, the damage increases by {@scaledamage 8d6|3-9|1d6} for each slot level above 3rd."] }],
    damageInflict: ["fire"], savingThrow: ["dexterity"],
  },
  {
    name: "Counterspell", source: "PHB", level: 3, school: "A",
    time: [{ number: 1, unit: "reaction" }],
    range: { type: "point", distance: { type: "feet", amount: 60 } },
    components: { s: true },
    duration: [{ type: "instant" }],
    entries: ["You attempt to interrupt a creature in the process of casting a spell. If the creature is casting a spell of 3rd level or lower, its spell fails and has no effect. If it is casting a spell of 4th level or higher, make an ability check using your spellcasting ability. The DC equals 10 + the spell's level. On a success, the creature's spell fails and has no effect."],
    entriesHigherLevel: [{ type: "entries", name: "At Higher Levels", entries: ["When you cast this spell using a spell slot of 4th level or higher, the interrupted spell has no effect if its level is less than or equal to the level of the spell slot you used."] }],
  },
  {
    name: "Polymorph", source: "PHB", level: 4, school: "T",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "feet", amount: 60 } },
    components: { v: true, s: true, m: "a caterpillar cocoon" },
    duration: [{ type: "timed", duration: { type: "hour", amount: 1 }, concentration: true }],
    entries: ["This spell transforms a creature that you can see within range into a new form. An unwilling creature must make a Wisdom saving throw to avoid the effect. The spell has no effect on a shapechanger or a creature with 0 hit points."],
    savingThrow: ["wisdom"],
  },
  {
    name: "Wish", source: "PHB", level: 9, school: "C",
    time: [{ number: 1, unit: "action" }],
    range: { type: "point", distance: { type: "self" } },
    components: { v: true },
    duration: [{ type: "instant" }],
    entries: ["Wish is the mightiest spell a mortal creature can cast. By simply speaking aloud, you can alter the very foundations of reality in accord with your desires."],
  },
] };

// ── Dev seed: 5e SRD languages (XPHB standard + rare + PHB exotic) ───────────
const MOCK_E5_LANGUAGES = { language: [
  // Standard
  { name: "Common",              source: "XPHB", type: "standard", origin: "Sigil" },
  { name: "Common Sign Language",source: "XPHB", type: "standard", origin: "Sigil" },
  { name: "Draconic",            source: "XPHB", type: "standard", origin: "Dragons",     script: "Draconic" },
  { name: "Dwarvish",            source: "XPHB", type: "standard", origin: "Dwarves",     script: "Dwarvish" },
  { name: "Elvish",              source: "XPHB", type: "standard", origin: "Elves",       script: "Elvish" },
  { name: "Giant",               source: "XPHB", type: "standard", origin: "Giants",      script: "Dwarvish" },
  { name: "Gnomish",             source: "XPHB", type: "standard", origin: "Gnomes",      script: "Dwarvish" },
  { name: "Goblin",              source: "XPHB", type: "standard", origin: "Goblinoids",  script: "Dwarvish" },
  { name: "Halfling",            source: "XPHB", type: "standard", origin: "Halflings",   script: "Common" },
  { name: "Orc",                 source: "XPHB", type: "standard", origin: "Orcs",        script: "Dwarvish" },
  // Rare (XPHB)
  { name: "Abyssal",             source: "XPHB", type: "rare",     origin: "Demons of the Abyss" },
  { name: "Celestial",           source: "XPHB", type: "rare",     origin: "Celestials",  script: "Celestial" },
  { name: "Deep Speech",         source: "XPHB", type: "rare",     origin: "Aberrations" },
  { name: "Druidic",             source: "XPHB", type: "rare",     origin: "Druidic circles" },
  { name: "Infernal",            source: "XPHB", type: "rare",     origin: "Devils of the Nine Hells", script: "Infernal" },
  { name: "Primordial",          source: "XPHB", type: "rare",     origin: "Elementals",  dialects: ["Auran","Aquan","Ignan","Terran"] },
  { name: "Thieves' Cant",       source: "XPHB", type: "rare",     origin: "Rogues" },
  // Exotic (PHB)
  { name: "Sylvan",              source: "PHB",  type: "exotic",   origin: "Fey creatures", script: "Elvish" },
  { name: "Undercommon",         source: "PHB",  type: "exotic",   origin: "Underdark traders", script: "Elvish" },
] };

// ─── ApiMock ──────────────────────────────────────────────────────────────────
// Mirrors the real CardAPI interface so components can run in dev without a
// server connection. Property objects match the server shape: { id, name, value,
// parentId } so any code that reads prop.id / prop.parentId works correctly.

export const ApiMock = {
  _properties: {},          // name → { id, name, value, parentId }
  _propertySubscriptions: {}, // name → callback[]
  _globalProperties: {      // parentId → { name → { id, name, value, parentId } }
    global: {
      "5e_sources_list": { id: "mock-prop-global-sources", name: "5e_sources_list", value: ["phb"], parentId: "global" },
    },
  },
  _resources: {},           // key → { key, data, name, mimeType }
  _globalResources: {       // key → { key, data, name, mimeType } (non-sandboxed)
    "5e_items": {
      id: "mock-res-5e-items",
      key: "5e_items",
      data: MOCK_5E_ITEMS,
      name: "5e_items.json",
      mimeType: "application/json",
    },
    "E5_languages": {
      id: "mock-res-e5-languages",
      key: "E5_languages",
      data: MOCK_E5_LANGUAGES,
      name: "E5_languages.json",
      mimeType: "application/json",
    },
    "5e_spells_phb": {
      id: "mock-res-5e-spells-phb",
      key: "5e_spells_phb",
      data: MOCK_5E_SPELLS_PHB,
      name: "5e_spells_phb.json",
      mimeType: "application/json",
    },
  },
  _cardId: "mock-card-id",

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  InitApi: async () => {
    console.log("ApiMock.InitApi: mock ready — 5e_items seeded with", MOCK_5E_ITEMS.item.length, "items");
  },

  destroy: () => {
    ApiMock._propertySubscriptions = {};
    ApiMock._properties = {};
    ApiMock._globalProperties = {};
  },

  // ── Properties ──────────────────────────────────────────────────────────────

  Properties: {
    /** Create property if it doesn't exist yet. No-op if already present. */
    Init: async (propertyName, value) => {
      if (!ApiMock._properties[propertyName]) {
        ApiMock._properties[propertyName] = {
          id: _mkId(),
          name: propertyName,
          value,
          parentId: ApiMock._cardId,
        };
        (ApiMock._propertySubscriptions[propertyName] ?? []).forEach((cb) =>
          cb(ApiMock._properties[propertyName])
        );
      }
      return true;
    },

    /** Init multiple — creates only those that don't exist yet. */
    InitMany: async (properties) => {
      await Promise.all(properties.map((p) => ApiMock.Properties.Init(p.name, p.value)));
    },

    Get: async (propertyName) => {
      return ApiMock._properties[propertyName] ?? null;
    },

    GetMany: async (propertyNames) => {
      return propertyNames.map((n) => ApiMock._properties[n]).filter(Boolean);
    },

    /** Alias for GetMany — matches CardAPI.Properties.GetByNames. */
    GetByNames: async (propertyNames) => {
      return ApiMock.Properties.GetMany(propertyNames);
    },

    /** Returns all properties for this mock card. */
    GetProperties: async () => {
      return Object.values(ApiMock._properties);
    },

    /**
     * Set a property. Uses loose equality (==) to skip no-ops — identical to
     * the real CardAPI so computed fields don't cause infinite update loops.
     */
    Set: async (propertyName, value) => {
      const existing = ApiMock._properties[propertyName];
      if (existing) {
        // eslint-disable-next-line eqeqeq
        if (existing.value == value) return; // no change — skip notify
        ApiMock._properties[propertyName] = { ...existing, value };
      } else {
        ApiMock._properties[propertyName] = {
          id: _mkId(),
          name: propertyName,
          value,
          parentId: ApiMock._cardId,
        };
      }
      const prop = ApiMock._properties[propertyName];
      (ApiMock._propertySubscriptions[propertyName] ?? []).forEach((cb) => cb(prop));
    },

    SetMany: async (properties) => {
      await Promise.all(properties.map((p) => ApiMock.Properties.Set(p.name, p.value)));
    },

    Remove: async (propertyName) => {
      delete ApiMock._properties[propertyName];
      (ApiMock._propertySubscriptions[propertyName] ?? []).forEach((cb) => cb(null));
      return true;
    },

    Subscribe: (propertyName, callback) => {
      if (!ApiMock._propertySubscriptions[propertyName]) {
        ApiMock._propertySubscriptions[propertyName] = [];
      }
      ApiMock._propertySubscriptions[propertyName].push(callback);
    },

    Unsubscribe: (propertyName, callback) => {
      const subs = ApiMock._propertySubscriptions[propertyName];
      if (!subs) return;
      const index = subs.indexOf(callback);
      if (index !== -1) subs.splice(index, 1);
    },

    /**
     * Access properties of any entity without being locked to this card's parentId.
     * parentId must be supplied explicitly for every call.
     */
    Global: {
      Get: async (parentId, propertyName) => {
        return ApiMock._globalProperties[parentId]?.[propertyName] ?? null;
      },

      GetMany: async (parentId, propertyNames) => {
        const store = ApiMock._globalProperties[parentId] ?? {};
        return propertyNames.map((n) => store[n]).filter(Boolean);
      },

      GetByNames: async (parentId, propertyNames) => {
        return ApiMock.Properties.Global.GetMany(parentId, propertyNames);
      },

      GetProperties: async (parentId) => {
        return Object.values(ApiMock._globalProperties[parentId] ?? {});
      },

      Set: async (parentId, propertyName, value) => {
        if (!ApiMock._globalProperties[parentId]) ApiMock._globalProperties[parentId] = {};
        const existing = ApiMock._globalProperties[parentId][propertyName];
        if (existing) {
          // eslint-disable-next-line eqeqeq
          if (existing.value == value) return;
          ApiMock._globalProperties[parentId][propertyName] = { ...existing, value };
        } else {
          ApiMock._globalProperties[parentId][propertyName] = {
            id: _mkId(),
            name: propertyName,
            value,
            parentId,
          };
        }
      },

      SetMany: async (parentId, properties) => {
        await Promise.all(properties.map((p) => ApiMock.Properties.Global.Set(parentId, p.name, p.value)));
      },

      Init: async (parentId, propertyName, value) => {
        if (!ApiMock._globalProperties[parentId]) ApiMock._globalProperties[parentId] = {};
        if (!ApiMock._globalProperties[parentId][propertyName]) {
          ApiMock._globalProperties[parentId][propertyName] = {
            id: _mkId(),
            name: propertyName,
            value,
            parentId,
          };
        }
      },

      InitMany: async (parentId, properties) => {
        await Promise.all(properties.map((p) => ApiMock.Properties.Global.Init(parentId, p.name, p.value)));
      },

      Remove: async (parentId, propertyName) => {
        delete ApiMock._globalProperties[parentId]?.[propertyName];
      },
    },
  },

  // ── Resources ───────────────────────────────────────────────────────────────
  // In-memory store. For dev testing, store images as data-URL strings so
  // they work directly as <img src>. In production the real API returns a Blob
  // for binary types — Bio5E handles both cases via URL.createObjectURL().

  Resources: {
    Create: async (key, data, name, mimeType) => {
      if (ApiMock._resources[key]) {
        throw new Error(`ApiMock.Resources: key "${key}" already exists — use Upsert to overwrite.`);
      }
      const id = _mkId();
      ApiMock._resources[key] = { id, key, data, name: name ?? key, mimeType };
      return id;
    },

    Read: async (key) => {
      return ApiMock._resources[key]?.data ?? null;
    },

    Update: async (key, data, mimeType) => {
      if (!ApiMock._resources[key]) throw new Error(`ApiMock.Resources: key "${key}" not found.`);
      ApiMock._resources[key] = {
        ...ApiMock._resources[key],
        data,
        ...(mimeType ? { mimeType } : {}),
      };
    },

    Delete: async (key) => {
      delete ApiMock._resources[key];
    },

    Upsert: async (key, data, name, mimeType) => {
      if (ApiMock._resources[key]) {
        await ApiMock.Resources.Update(key, data, mimeType);
      } else {
        return await ApiMock.Resources.Create(key, data, name, mimeType);
      }
    },

    /** Returns all resource keys currently in the store. */
    List: async () => Object.keys(ApiMock._resources),

    Global: {
      Create: async (key, data, name, mimeType) => {
        if (ApiMock._globalResources[key]) {
          throw new Error(`ApiMock.Resources.Global: key "${key}" already exists — use Upsert to overwrite.`);
        }
        const id = _mkId();
        ApiMock._globalResources[key] = { id, key, data, name: name ?? key, mimeType };
        return id;
      },

      Read: async (key) => {
        return ApiMock._globalResources[key]?.data ?? null;
      },

      Update: async (key, data, mimeType) => {
        if (!ApiMock._globalResources[key]) throw new Error(`ApiMock.Resources.Global: key "${key}" not found.`);
        ApiMock._globalResources[key] = {
          ...ApiMock._globalResources[key],
          data,
          ...(mimeType ? { mimeType } : {}),
        };
      },

      Delete: async (key) => {
        delete ApiMock._globalResources[key];
      },

      Upsert: async (key, data, name, mimeType) => {
        if (ApiMock._globalResources[key]) {
          await ApiMock.Resources.Global.Update(key, data, mimeType);
        } else {
          return await ApiMock.Resources.Global.Create(key, data, name, mimeType);
        }
      },

      List: async () => Object.keys(ApiMock._globalResources),
    },
  },

  // ── ClientMediator ──────────────────────────────────────────────────────────

  ClientMediator: {
    sendCommand: (panel, command, data) => {
      console.warn("ApiMock.ClientMediator.sendCommand", panel, command, data);
      return undefined;
    },
    sendCommandAsync: async (panel, command, data) => {
      console.warn("ApiMock.ClientMediator.sendCommandAsync", panel, command, data);
      return undefined;
    },
    /** Panel name must start with "addon_" — scoped to mock cardId, same as real CardAPI. */
    register: (name, manager) => {
      if (!name.startsWith("addon_")) {
        console.error(`ApiMock.ClientMediator.register: name must start with "addon_" — got "${name}"`);
        return undefined;
      }
      const scopedName = `addon_${ApiMock._cardId}_${name.slice("addon_".length)}`;
      console.warn("ApiMock.ClientMediator.register", scopedName, manager);
      return scopedName;
    },
  },

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** cardId is always appended — mirrors real CardAPI.FireAction. */
  FireAction: (action, args) => {
    console.warn("ApiMock.FireAction", action, { ...args, cardId: ApiMock._cardId });
  },

  // ── Chat ────────────────────────────────────────────────────────────────────

  SendChatMessage: (message) => {
    console.warn("ApiMock.SendChatMessage", message);
  },

  // ── Custom WS commands ──────────────────────────────────────────────────────

  /** Only "custom_" prefixed commands allowed — matches real CardAPI allowlist. */
  SendCustomCommandToServer: (command, data) => {
    if (!command.startsWith("custom_")) {
      console.error(`ApiMock: blocked command "${command}" — must start with "custom_"`);
      return;
    }
    console.warn("ApiMock.SendCustomCommandToServer", command, data);
  },
};

export default ApiMock;

