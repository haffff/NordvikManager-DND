import { useSourceData } from "./useSourceData";

/** Every spell from the game's configured spell sources (see useSourceData). */
export const useSpellsData = (Api) => {
  const { data, loading, error, load } = useSourceData(Api, "spellSources", "dnd5e_spells_", (d) => d.spell ?? d.item);
  return { spells: data, loading, error, load };
};
