import { ItemResponse as Product } from "@/types";
import { create } from "zustand";

interface ProductStore {
  currentProduct: Product | undefined,
  setCurrentProduct: (product: Product) => void
}

export const currentProductStore = create<ProductStore>((set) => ({
  currentProduct: undefined,
  setCurrentProduct: (product) => set({ currentProduct: product})
}))

