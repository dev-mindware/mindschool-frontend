import { useMutation, useQueryClient } from "@tanstack/react-query";
import { banksService } from "@/services/banks-service";
import { SucessMessage } from "@/utils/messages";
import { BankFormData } from "@/schemas/bank-schema";

export function useUpdateBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BankFormData }) =>
      banksService.updateBank(id, data),
    onSuccess: () => {
      SucessMessage("Banco actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });
}
