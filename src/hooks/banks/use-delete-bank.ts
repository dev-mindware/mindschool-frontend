import { useMutation, useQueryClient } from "@tanstack/react-query";
import { banksService } from "@/services/banks-service";
import { SucessMessage } from "@/utils/messages";

export function useDeleteBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => banksService.deleteBank(id),
    onSuccess: () => {
      SucessMessage("Banco removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });
}
