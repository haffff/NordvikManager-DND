// ─── ApiMock ──────────────────────────────────────────────────────────────────
// Mirrors the parts of the real CardAPI this view uses, so App.jsx runs in dev
// without a server: global resources kept in memory.
export const ApiMock = {
  _globalResources: {},

  InitApi: async () => {},
  destroy: () => {},

  Resources: {
    Global: {
      Read: async (key) => ApiMock._globalResources[key] ?? null,
      Upsert: async (key, data) => {
        ApiMock._globalResources[key] = data;
        return { key };
      },
    },
  },
};

export default ApiMock;
