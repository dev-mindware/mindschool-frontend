import { CreateItemData } from "@/types";
import { itemsService } from "@/services/items-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { extractErrorMessage } from "@/utils/error-handler";

export function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemData) => itemsService.addItem(data),
    onSuccess: () => {
      SucessMessage("Item adicionado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error: unknown) => {
      ErrorMessage(
        extractErrorMessage(error, "Não foi possível adicionar o item. Verifique os dados e tente novamente.")
      );
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateItemData> }) =>
      itemsService.updateItem(id, data),
    onSuccess: () => {
      SucessMessage("Item actualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error: unknown) => {
      ErrorMessage(
        extractErrorMessage(error, "Não foi possível atualizar o item. Verifique os dados e tente novamente.")
      );
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemsService.deleteItem(id),
    onSuccess: () => {
      SucessMessage("Item removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error: unknown) => {
      ErrorMessage(
        extractErrorMessage(error, "Não foi possível remover o item.")
      );
    },
  });
}

export function useToggleStatusItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemsService.toggleStatusItem(id),
    onSuccess: () => {
      SucessMessage("Status do item alterado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error: unknown) => {
      ErrorMessage(
        extractErrorMessage(error, "Não foi possível alterar o estado do item.")
      );
    },
  });
}

