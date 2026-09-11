import { Button, GlobalModal, ProtectedAction } from "@/components";
import { useDeleteStore } from "@/hooks/entities";
import { currentStoreStore } from "@/stores/entities/current-store-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage } from "@/utils/messages";

export function DeleteStoreModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-store"];
  const { currentStore } = currentStoreStore();
  const { mutateAsync: deleteItemMutate, isPending } = useDeleteStore();

  async function handleDelete(id: string) {
    if (!currentStore) return;
    try {
      await deleteItemMutate(id);
      closeModal("delete-store");
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(error.response.data.message || `Erro ao apagar a loja.`);
      } else {
        ErrorMessage(
          `Ocorreu um erro desconhecido ao apagar a loja. Tente novamente.`
        );
      }
    }
  }

  if (!isOpen) return null;

  return (
    <GlobalModal
      warning
      canClose
      className="!w-max"
      id="delete-store"
      title={`Tem certeza que deseja apagar a loja ${currentStore?.name}?`}
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4">
        <Button onClick={() => closeModal("delete-store")} variant="outline">
          Cancelar
        </Button>
        <ProtectedAction>
          <Button
            disabled={isPending}
            variant="destructive"
            onClick={() => handleDelete(currentStore?.id!)}
          >
            {isPending ? "Apagando..." : `Apagar ${currentStore?.name}`}
          </Button>
        </ProtectedAction>
      </div>
    </GlobalModal>
  );
}
