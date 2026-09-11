import { stockService } from "@/services/stock-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";
import {
  StockCreateData,
  StockAdjustData,
  StockReserveData,
  StockUnreserveData,
} from "@/types/stock";
import { stockReservationsService } from "@/services";

export function useAddStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StockCreateData) => stockService.addStock(data),
    onSuccess: () => {
      SucessMessage("Stock adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<StockCreateData>;
    }) => stockService.updateStock(id, data),
    onSuccess: () => {
      SucessMessage("Stock actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useDeleteStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stockService.deleteStock(id),
    onSuccess: () => {
      SucessMessage("Stock removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockAdjustData }) =>
      stockService.adjustStock(id, data),
    onSuccess: () => {
      SucessMessage("Stock ajustado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}

export function useUnreserveStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockUnreserveData }) =>
      stockService.unreserveStock(id, data),
    onSuccess: () => {
      SucessMessage("Reserva liberada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    },
  });
}
