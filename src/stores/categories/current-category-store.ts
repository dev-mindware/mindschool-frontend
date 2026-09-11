import { Category } from "@/types";
import { create } from "zustand";

interface CategoryStore {
  currentCategory: Category | undefined,
  setCurrentCategory: (category: Category) => void
}

export const currentCategoryStore = create<CategoryStore>((set) => ({
  currentCategory: undefined,
  setCurrentCategory: (category) => set({ currentCategory: category})
}))
