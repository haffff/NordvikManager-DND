// ── ID helper ──────────────────────────────────────────────────────────────────
let _idCounter = 1;
const _mkId = () => `mock-prop-${_idCounter++}`;

// ── Dev seed: default card config ─────────────────────────────────────────────
const MOCK_CONFIG = {
  attributes: [
    { attribute: "strength",     initAttribute: 10, initModifier: 0 },
    { attribute: "dexterity",    initAttribute: 10, initModifier: 0 },
    { attribute: "constitution", initAttribute: 10, initModifier: 0 },
    { attribute: "intelligence", initAttribute: 10, initModifier: 0 },
    { attribute: "wisdom",       initAttribute: 10, initModifier: 0 },
    { attribute: "charisma",     initAttribute: 10, initModifier: 0 },
  ],
  skills: [
    { name: "Acrobatics",      modifier: "dexterity"    },
    { name: "Animal Handling", modifier: "wisdom"       },
    { name: "Arcana",          modifier: "intelligence" },
    { name: "Athletics",       modifier: "strength"     },
    { name: "Deception",       modifier: "charisma"     },
    { name: "History",         modifier: "intelligence" },
    { name: "Insight",         modifier: "wisdom"       },
    { name: "Intimidation",    modifier: "charisma"     },
    { name: "Investigation",   modifier: "intelligence" },
    { name: "Medicine",        modifier: "wisdom"       },
    { name: "Nature",          modifier: "intelligence" },
    { name: "Perception",      modifier: "wisdom"       },
    { name: "Performance",     modifier: "charisma"     },
    { name: "Persuasion",      modifier: "charisma"     },
    { name: "Religion",        modifier: "intelligence" },
    { name: "Sleight of Hand", modifier: "dexterity"   },
    { name: "Stealth",         modifier: "dexterity"   },
    { name: "Survival",        modifier: "wisdom"       },
  ],
};

// ─── ApiMock ──────────────────────────────────────────────────────────────────
// Mirrors the real CardAPI interface so components can run in dev without a
// server connection. Property objects match the server shape: { id, name, value,
// parentId } so any code that reads prop.id / prop.parentId works correctly.

export const ApiMock = {
  _properties: {
    dnd5e_config: {
      id: "mock-prop-config",
      name: "dnd5e_config",
      value: MOCK_CONFIG,
      parentId: "mock-card-id",
    },
  },  _propertySubscriptions: {},
  _globalProperties: {      // parentId → { name → { id, name, value, parentId } }
    global: {
      "5e_sources_list": { id: "mock-prop-global-sources", name: "5e_sources_list", value: ["phb"], parentId: "global" },
    },
  },
  _globalPropertySubscriptions: {}, // "parentId:name" → callback[]
  _resources: {},
  _globalResources: {},
  _cardId: "mock-card-id",

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  InitApi: async () => {
    console.log("ApiMock.InitApi: mock ready — config seeded with", MOCK_CONFIG.attributes.length, "attributes,", MOCK_CONFIG.skills.length, "skills");
  },
  destroy: () => {
    ApiMock._propertySubscriptions = {};
    ApiMock._properties = {};
    ApiMock._globalProperties = {};
    ApiMock._globalPropertySubscriptions = {};
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
      },      Set: async (parentId, propertyName, value) => {
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
        const prop = ApiMock._globalProperties[parentId][propertyName];
        const key = parentId + ':' + propertyName;
        (ApiMock._globalPropertySubscriptions[key] ?? []).forEach((cb) => cb(prop));
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
          const prop = ApiMock._globalProperties[parentId][propertyName];
          const key = parentId + ':' + propertyName;
          (ApiMock._globalPropertySubscriptions[key] ?? []).forEach((cb) => cb(prop));
        }
      },

      InitMany: async (parentId, properties) => {
        await Promise.all(properties.map((p) => ApiMock.Properties.Global.Init(parentId, p.name, p.value)));
      },

      Remove: async (parentId, propertyName) => {
        delete ApiMock._globalProperties[parentId]?.[propertyName];
      },

      Subscribe: (parentId, propertyName, callback) => {
        const key = parentId + ':' + propertyName;
        if (!ApiMock._globalPropertySubscriptions[key]) {
          ApiMock._globalPropertySubscriptions[key] = [];
        }
        ApiMock._globalPropertySubscriptions[key].push(callback);
      },

      Unsubscribe: (parentId, propertyName, callback) => {
        const key = parentId + ':' + propertyName;
        const subs = ApiMock._globalPropertySubscriptions[key];
        if (!subs) return;
        const index = subs.indexOf(callback);
        if (index !== -1) subs.splice(index, 1);
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
      if(panel === "Game" && command === "GetGameId") {
        return "test-game-id";
      }
      console.warn("ApiMock.ClientMediator.sendCommand", panel, command, data);
      return undefined;
    },    sendCommandAsync: async (panel, command, data) => {
      if (panel === "Game" && command === "GetGameId") {
        return "test-game-id";
      }
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

