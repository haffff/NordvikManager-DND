import { useSourceData } from "./useSourceData";

/** Every feat from the game's configured feat sources (see useSourceData). */
export const useFeatsData = (Api) => {
  const { data, loading, error, load } = useSourceData(Api, "featSources", "dnd5e_feats_", (d) => d.feat);
  return { feats: data, loading, error, load };
};
