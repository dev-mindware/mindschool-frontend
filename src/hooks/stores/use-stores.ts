import type { StoreData } from "@/types";
import { storesService } from "@/services/stores-service";
import { SucessMessage } from "@/utils/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreData) => storesService.addStore(data),
    onSuccess: () => {
      SucessMessage("Loja adicionada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
}
