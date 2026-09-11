import { api } from "./api";
import { StockReserveData, StockReservationResponse } from "@/types/stock";

export const stockReservationsService = {
    reserveStock: async (data: StockReserveData) => {
        return api.post(`/stock-reservations`, data);
    },
    getAllReservations: async () => {
        return api.get<StockReservationResponse[]>(`/stock-reservations`);
    },
    updateReservation: async (id: string, data: StockReserveData) => {
        return api.patch(`/stock-reservations/${id}`, data);
    },
    cancelReservation: async (id: string) => {
        return api.delete(`/stock-reservations/${id}/cancel`);
    },
};