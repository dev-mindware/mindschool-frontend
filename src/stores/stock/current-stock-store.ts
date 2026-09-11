import { create } from "zustand";
import { StockResponse, StockReservationResponse } from "@/types/stock";

type CurrentStockStore = {
  currentStock: StockResponse | null;
  setCurrentStock: (stock: StockResponse | null) => void;
  currentReservation: StockReservationResponse | null;
  setCurrentReservation: (reservation: StockReservationResponse | null) => void;
};

export const currentStockStore = create<CurrentStockStore>((set) => ({
  currentStock: null,
  setCurrentStock: (stock) => set({ currentStock: stock }),
  currentReservation: null,
  setCurrentReservation: (reservation) =>
    set({ currentReservation: reservation }),
}));
