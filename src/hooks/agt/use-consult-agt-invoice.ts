import { useMutation } from "@tanstack/react-query";
import { agtService } from "@/services";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils";
import type {
  AgtConsultDocument,
  AgtConsultResponse,
} from "@/types";

function extractDocument(
  data: AgtConsultResponse,
): AgtConsultDocument | null {
  const result = data.statusResult || data;

  if (result.documentResult) {
    return result.documentResult;
  }

  if (result.documentNo) {
    return result as AgtConsultDocument;
  }

  return null;
}

export function useConsultAgtInvoice() {
  return useMutation({
    mutationFn: (documentNo: string) => agtService.consultInvoice(documentNo),
    onSuccess: (data) => {
      const document = extractDocument(data);

      if (document) {
        SucessMessage("Documento encontrado no repositório AGT.");
        return;
      }

      if (data.errorList && data.errorList.length > 0) {
        ErrorMessage(
          data.errorList[0].descriptionError || "Erro na consulta.",
        );
        return;
      }

      ErrorMessage("Documento não encontrado.");
    },
    onError: (error) => {
      ErrorMessage(getApiErrorMessage(error, "Erro ao consultar documento."));
    },
  });
}

export function getConsultedDocument(
  data: AgtConsultResponse | undefined,
): AgtConsultDocument | null {
  if (!data) return null;
  return extractDocument(data);
}
