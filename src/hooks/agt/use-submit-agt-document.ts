import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agtService } from "@/services";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

export function useSubmitAgtDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      type = "invoice",
    }: {
      id: string;
      type?: "invoice" | "creditNote";
    }) => agtService.submitDocument(id, type),
    onSuccess: (data) => {
      SucessMessage(data?.message || "Submissão para a AGT iniciada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-receipt"] });
      queryClient.invalidateQueries({ queryKey: ["normal-invoice"] });
      queryClient.invalidateQueries({ queryKey: ["credit-notes"] });
      queryClient.invalidateQueries({ queryKey: ["agt-errors"] });
      queryClient.invalidateQueries({ queryKey: ["agt-invoices"] });
    },
    onError: (error: any) => {
      ErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Erro ao submeter documento para a AGT.",
      );
    },
  });
}
