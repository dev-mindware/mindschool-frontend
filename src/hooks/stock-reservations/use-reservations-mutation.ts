import { useMutation, useQueryClient } from "@tanstack/react-query";
import { stockReservationsService } from "@/services";
import { StockReserveData } from "@/types/stock";
import { SucessMessage } from "@/utils/messages";

export function useReserveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockReserveData) =>
      stockReservationsService.reserveStock(data),
    onSuccess: () => {
      SucessMessage("Stock reservado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] });
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockReserveData }) =>
      stockReservationsService.updateReservation(id, data),
    onSuccess: () => {
      SucessMessage("Reserva actualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockReservationsService.cancelReservation(id),
    onSuccess: () => {
      SucessMessage("Reserva cancelada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] });
    },
  });
}
