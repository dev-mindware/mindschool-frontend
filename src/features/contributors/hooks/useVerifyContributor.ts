import { useMutation } from "@tanstack/react-query";

interface VerifyContributorPayload {
  tipoDocumento: string;
  numeroDocumento: string;
}

interface Contributor {
  numeroNIF: string;
  nome: string;
  tipoContribuinte: string;
  estadoContribuinte: string;
  regimeIva: string;
  indicadorNaoResidente: boolean;
}

interface VerifyContributorResponse {
  message: string;
  contributor: Contributor;
}

export function useVerifyContributor() {
  return useMutation({
    mutationFn: async (
      payload: VerifyContributorPayload
    ): Promise<VerifyContributorResponse> => {
      const response = await fetch("/api/contributors/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Erro ao verificar contribuinte.");
      }

      return data;
    },
  });
}
