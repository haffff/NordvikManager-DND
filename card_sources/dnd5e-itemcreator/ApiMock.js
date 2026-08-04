// ── Dev seed: a handful of SRD items so the search box has something to find ──
const MOCK_5E_ITEMS = { item: [
  { name: "Dagger", source: "PHB", type: "M", rarity: "none", weight: 1, value: 200, weaponCategory: "simple", dmg1: "1d4", dmgType: "P" },
  { name: "Longsword", source: "PHB", type: "M", rarity: "none", weight: 3, value: 1500, weaponCategory: "martial", dmg1: "1d8", dmgType: "S" },
  { name: "Bag of Holding", source: "DMG", type: "G", rarity: "uncommon", weight: 15, value: 0, entries: ["This bag has an interior space considerably larger than its outside dimensions."] },
  { name: "Leather Armor", source: "PHB", type: "LA", rarity: "none", weight: 10, value: 1000, entries: ["The breastplate and shoulder protectors of this armor are made of leather that has been stiffened by being boiled in oil."] },
  { name: "Potion of Healing", source: "DMG", type: "P", rarity: "common", weight: 0.5, value: 5000, entries: ["You regain 2d4 + 2 hit points when you drink this potion."] },
] };

// ─── ApiMock ──────────────────────────────────────────────────────────────────
// Mirrors the real CardAPI interface so App.jsx can run in dev without a server
// connection. Only what this tool actually uses is implemented (search + FireAction).

export const ApiMock = {
  _globalResources: {
    "dnd5e_items": {
      id: "mock-res-dnd5e-items",
      key: "dnd5e_items",
      data: MOCK_5E_ITEMS,
      name: "dnd5e_items.json",
      mimeType: "application/json",
    },
  },
  _cardId: "mock-itemcreator-card-id",

  InitApi: async () => {
    console.log("ApiMock.InitApi: mock ready — dnd5e_items seeded with", MOCK_5E_ITEMS.item.length, "items");
  },
  destroy: () => {},

  Resources: {
    Global: {
      Read: async (key) => {
        return ApiMock._globalResources[key]?.data ?? null;
      },
    },
  },

  ClientMediator: {
    sendCommand: (panel, command, data) => {
      if (panel === "Game" && command === "GetGameId") return "test-game-id";
      console.warn("ApiMock.ClientMediator.sendCommand", panel, command, data);
      return undefined;
    },
    sendCommandAsync: async (panel, command, data) => {
      if (panel === "Game" && command === "GetGameId") return "test-game-id";
      console.warn("ApiMock.ClientMediator.sendCommandAsync", panel, command, data);
      return undefined;
    },
  },

  /** cardId is always appended — mirrors real CardAPI.FireAction. */
  FireAction: (action, args) => {
    console.warn("ApiMock.FireAction", action, { ...args, cardId: ApiMock._cardId });
  },
};

export default ApiMock;
