// ─── ApiMock ──────────────────────────────────────────────────────────────────
// Mirrors the parts of the real CardAPI this view uses, so App.jsx runs in dev
// without a server: one configured SRD 5.2 bestiary source with two monsters.
const MOCK_BESTIARY = { monster: [
  { name: "Goblin Warrior", source: "XMM", srdEditions: ["5.2"], size: ["S"], type: { type: "fey", tags: ["goblinoid"] }, alignment: ["C", "N"], ac: [15], hp: { average: 10, formula: "3d6" }, speed: { walk: 30 }, str: 8, dex: 15, con: 10, int: 10, wis: 8, cha: 8, skill: { stealth: "+6" }, senses: ["Darkvision 60 ft."], passive: 9, languages: ["Common", "Goblin"], cr: "1/4", action: [{ name: "Scimitar", entries: ["{@atkr m} {@hit 4}, reach 5 ft. {@h}5 ({@damage 1d6 + 2}) Slashing damage."] }] },
  { name: "Wolf", source: "XMM", srdEditions: ["5.2"], size: ["M"], type: "beast", alignment: ["U"], ac: [12], hp: { average: 11, formula: "2d8 + 2" }, speed: { walk: 40 }, str: 14, dex: 15, con: 12, int: 3, wis: 12, cha: 6, passive: 15, cr: "1/4", action: [{ name: "Bite", entries: ["{@atkr m} {@hit 4}, reach 5 ft. {@h}5 ({@damage 1d6 + 2}) Piercing damage."] }] },
] };

export const ApiMock = {
  InitApi: async () => {},
  destroy: () => {},
  ClientMediator: {
    sendCommandAsync: async (panel, command) => (panel === "Game" && command === "GetGameId" ? "test-game-id" : undefined),
  },
  Properties: {
    Global: {
      Get: async (parentId, name) =>
        name === "dnd5e_config" ? { value: JSON.stringify({ bestiarySources: [{ name: "SRD 5.2", url: "" }] }) } : null,
    },
  },
  Resources: {
    Global: {
      Read: async (key) => (key === "dnd5e_bestiary_srd_5_2" ? MOCK_BESTIARY : null),
    },
  },
  FireAction: (action, args) => console.warn("ApiMock.FireAction", action, args),
  Close: () => console.warn("ApiMock.Close"),
};

export default ApiMock;
