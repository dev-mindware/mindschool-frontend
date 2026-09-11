import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agtService } from "@/services";
import { SucessMessage } from "@/utils/messages";

export function useUpdateAgtPrivateKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (privateKey: string) =>
      agtService.updatePrivateKey(privateKey),
    onSuccess: () => {
      SucessMessage("Chave privada da AGT actualizada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["agt-status"] });
    },
  });
}
