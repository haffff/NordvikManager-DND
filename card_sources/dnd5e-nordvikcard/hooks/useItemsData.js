import { useSourceData } from "./useSourceData";

/** Every item from the game's configured item sources and its homebrew (see useSourceData). */
export const useItemsData = (Api) => {
  const { data, loading, error, load } = useSourceData(Api, "itemSources", "dnd5e_items_", (d) => d.item);
  return { items: data, loading, error, load };
};
