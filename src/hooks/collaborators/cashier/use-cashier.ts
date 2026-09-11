import { CashierData } from "@/types";
import { cashierService } from "@/services/cashier-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CashierData) =>
      cashierService.addCashier(data),
    onSuccess: () => {
      SucessMessage("Caixa adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });
}

export function useUpdateCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CashierData>;
    }) => cashierService.updateCashier(id, data as any),
    onSuccess: () => {
      SucessMessage("Caixa actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });
}

export function useDeleteCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cashierService.deleteCashier(id),
    onSuccess: () => {
      SucessMessage("Caixa removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });
}

export function useToggleStatusCashier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      cashierService.toggleStatusCashier(id),
    onSuccess: () => {
      SucessMessage("Status alterado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["cashiers"] });
    },
  });
}
