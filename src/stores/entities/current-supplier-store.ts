import { SupplierResponse } from "@/types";
import { create } from "zustand";

interface SupplierStore {
  currentSupplier: SupplierResponse | undefined;
  setCurrentSupplier: (supplier: SupplierResponse) => void;
}

export const currentSupplierStore = create<SupplierStore>((set) => ({
  currentSupplier: undefined,
  setCurrentSupplier: (supplier) => set({ currentSupplier: supplier }),
}));
