import { useResourceData } from "./useResourceData";

/** Loads and caches the 5e SRD items dataset (key: "dnd5e_items"). */
export const useItemsData = (Api) =>
  useResourceData(Api, "dnd5e_items", (d) => d.item ?? d);
