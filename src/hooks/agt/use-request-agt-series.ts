import { useMutation, useQueryClient } from "@tanstack/react-query";
import { agtService } from "@/services";
import { SucessMessage } from "@/utils/messages";
import type { RequestAgtSeriesFormData } from "@/schemas/agt-schema";

export function useRequestAgtSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RequestAgtSeriesFormData) =>
      agtService.requestSeries(data),
    onSuccess: () => {
      SucessMessage("Nova série solicitada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["agt-series"] });
    },
  });
}
