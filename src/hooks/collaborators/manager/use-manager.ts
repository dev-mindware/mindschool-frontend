import { ManagerData } from "@/types";
import { managerService } from "@/services/manager-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage } from "@/utils/messages";

export function useAddManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ManagerData) => managerService.addManager(data),
    onSuccess: () => {
      SucessMessage("Gerente adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
  });
}

export function useUpdateManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ManagerData> }) =>
      managerService.updateManager(id, data as any),
    onSuccess: () => {
      SucessMessage("Gestor actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
  });
}

export function useDeleteManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => managerService.deleteManager(id),
    onSuccess: () => {
      SucessMessage("Gerente removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
  });
}

export function useToggleStatusManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => managerService.toggleStatusManager(id),
    onSuccess: () => {
      SucessMessage("Status alterado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["managers"] });
    },
  });
}
