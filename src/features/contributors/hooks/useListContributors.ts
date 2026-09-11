import { useMutation } from "@tanstack/react-query";

interface ListContributorsPayload {
  dataInicio: string;
  dataFim: string;
}

interface ListContributorItem {
  dataOperacao: string;
  numeroNIF: string;
  nomeContribuinte: string;
  estadoContribuinte: string;
  tipoContribuinte: string;
  operacao: string;
}

interface ListContributorsResponse {
  message: string;
  contributors: ListContributorItem[];
}

export function useListContributors() {
  return useMutation({
    mutationFn: async (
      payload: ListContributorsPayload
    ): Promise<ListContributorsResponse> => {
      const response = await fetch("/api/contributors/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Erro ao listar contribuintes.");
      }

      return data;
    },
  });
}
