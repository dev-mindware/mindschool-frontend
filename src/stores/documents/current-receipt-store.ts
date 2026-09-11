import { create } from "zustand";
import { ReceiptResponse } from "@/types/receipt";

interface ReceiptStore {
  currentReceipt: ReceiptResponse | undefined;
  setCurrentReceipt: (receipt: ReceiptResponse) => void;
}

export const currentReceiptStore = create<ReceiptStore>((set) => ({
  currentReceipt: undefined,
  setCurrentReceipt: (receipt) => set({ currentReceipt: receipt }),
}));
