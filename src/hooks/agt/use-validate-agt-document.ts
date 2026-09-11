import { useMutation } from "@tanstack/react-query";
import { agtService } from "@/services";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils";
import type { ValidateAgtDocumentFormData } from "@/schemas/agt-schema";

export function useValidateAgtDocument() {
  return useMutation({
    mutationFn: (data: ValidateAgtDocumentFormData) =>
      agtService.validateDocument(data),
    onSuccess: (_data, variables) => {
      SucessMessage(
        `Documento ${
          variables.action === "CONFIRMAR" ? "confirmado" : "rejeitado"
        } com sucesso.`,
      );
    },
    onError: (error) => {
      ErrorMessage(getApiErrorMessage(error, "Erro ao validar documento."));
    },
  });
}
