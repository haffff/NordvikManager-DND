// ── ID helper ──────────────────────────────────────────────────────────────────
let _idCounter = 1;
const _mkId = () => `mock-prop-${_idCounter++}`;

// ── Dev seed: sample monster (Young Red Dragon) ─────────────────────────────
const MOCK_MONSTER = {
  // pre-seeded properties for all monster fields
  monster_name: "Young Red Dragon",
  monster_size: "Large",
  monster_type: "dragon",
  monster_subtype: "",
  monster_alignment: "chaotic evil",
  cr: "10",
  strength_attribute: 23,
  dexterity_attribute: 10,
  constitution_attribute: 21,
  intelligence_attribute: 14,
  wisdom_attribute: 11,
  charisma_attribute: 19,
  strength_mod: 6,
  dexterity_mod: 0,
  constitution_mod: 5,
  intelligence_mod: 2,
  wisdom_mod: 0,
  charisma_mod: 4,
  armor: 18,
  hp: 178,
  maxhp: 178,
  speed: "40 ft., climb 40 ft., fly 80 ft.",
  senses: "blindsight 30 ft., darkvision 120 ft., passive Perception 19",
  languages: "Common, Draconic",
  saving_throws: "DEX +4, CON +9, WIS +4, CHA +8",
  skills_text: "Perception +9, Stealth +4",
  vulnerabilities: "",
  resistances: "",
  immunities: "fire",
  condition_immunities: "",
};

// ── Seeded traits ───────────────────────────────────────────────────────────
const MOCK_TRAITS = [
  { id: "trait-0", name: "Legendary Resistance (3/Day)", description: "If the dragon fails a saving throw, it can choose to succeed instead." },
];

// ── Seeded actions ──────────────────────────────────────────────────────────
const MOCK_ACTIONS = [
  { id: "action-0", name: "Multiattack", type: "other", description: "The dragon makes three attacks: one with its bite and two with its claws." },
  { id: "action-1", name: "Bite", type: "attack", attackBonus: "+10", damage: "2d10+6", damageType: "Piercing", reach: "10 ft.", range: "", description: "Plus 7 (2d6) fire damage." },
  { id: "action-2", name: "Claw", type: "attack", attackBonus: "+10", damage: "2d6+6", damageType: "Slashing", reach: "5 ft.", range: "", description: "" },
  { id: "action-3", name: "Fire Breath", type: "save", recharge: "5-6", saveDc: "17", saveAbility: "DEX", damage: "16d6", damageType: "Fire", description: "The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much on a successful one." },
];

// ─── ApiMock ──────────────────────────────────────────────────────────────────

export const ApiMock = {
  _properties: {},
  _propertySubscriptions: {},
  _globalProperties: {      // parentId → { name → { id, name, value, parentId } }
    global: {
      "5e_sources_list": { id: "mock-prop-global-sources", name: "5e_sources_list", value: ["phb"], parentId: "global" },
    },
  },
  _resources: {},
  _globalResources: {},
  _cardId: "mock-monster-id",

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  InitApi: async () => {
    // Pre-seed monster properties
    Object.entries(MOCK_MONSTER).forEach(([name, value]) => {
      ApiMock._properties[name] = { id: _mkId(), name, value, parentId: ApiMock._cardId };
    });

    // Seed traits via usePropertyList convention: traits_count + traits_0, traits_1...
    ApiMock._properties["traits_count"] = { id: _mkId(), name: "traits_count", value: MOCK_TRAITS.length, parentId: ApiMock._cardId };
    MOCK_TRAITS.forEach((trait, i) => {
      const name = `traits_${i}`;
      ApiMock._properties[name] = { id: _mkId(), name, value: JSON.stringify(trait), parentId: ApiMock._cardId };
    });

    // Seed actions
    ApiMock._properties["actions_count"] = { id: _mkId(), name: "actions_count", value: MOCK_ACTIONS.length, parentId: ApiMock._cardId };
    MOCK_ACTIONS.forEach((action, i) => {
      const name = `actions_${i}`;
      ApiMock._properties[name] = { id: _mkId(), name, value: JSON.stringify(action), parentId: ApiMock._cardId };
    });

    console.log("ApiMock.InitApi: monster mock ready");
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

      if(panel === "Game" && command === "GetGameId") {
        return "test-game-id";
      }

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

