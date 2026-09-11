import { SucessMessage } from "@/utils/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proformaService } from "@/services";
import { EditProformaFormData, ProformaFormData } from "@/schemas";
import { ProformData } from "@/types";

export function useDeleteProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => proformaService.deleteProforma(id),
    onSuccess: () => {
      SucessMessage("Proforma deletada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["invoice-proforma"] });
    },
  });
}

export function useCreateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProformData) => proformaService.createProforma(data),
    onSuccess: (response) => {
      SucessMessage("Proforma criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["invoice-proforma"] });
      return response.data;
    },
  });
}

export function useEditProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditProformaFormData }) =>
      proformaService.updateProforma(id, data),
    onSuccess: () => {
      SucessMessage("Proforma editada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["invoice-proforma"] });
    },
  });
}
