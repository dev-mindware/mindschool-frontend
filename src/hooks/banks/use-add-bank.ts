import { useMutation, useQueryClient } from "@tanstack/react-query";
import { banksService } from "@/services/banks-service";
import { SucessMessage } from "@/utils/messages";
import { BankFormData } from "@/schemas/bank-schema";

export function useAddBank() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BankFormData) =>
      banksService.addBank({ ...data, isDefault: data.isDefault ?? false }),
    onSuccess: () => {
      SucessMessage("Banco adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
    },
  });
}
