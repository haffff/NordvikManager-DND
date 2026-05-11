import { useResourceData } from "./useResourceData";

/** Loads and caches the 5e SRD items dataset (key: "5e_items"). */
export const useItemsData = (Api) =>
  useResourceData(Api, "5e_items", (d) => d.item ?? d);
