import { Button, GlobalModal, ProtectedAction } from "@/components";
import { currentManagerStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage } from "@/utils/messages";
import { useDeleteManager } from "@/hooks/collaborators";

export function DeleteManagerModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-manager"];
  const { currentManager } = currentManagerStore();
  const { mutateAsync: deleteItemMutate, isPending } = useDeleteManager();

  async function handleDelete(id: string) {
    if (!currentManager) return;
    try {
      await deleteItemMutate(id);
      closeModal("delete-manager");
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(
          error.response.data.message || `Erro ao apagar o gerente.`
        );
      } else {
        ErrorMessage(
          `Ocorreu um erro desconhecido ao apagar o gerente. Tente novamente.`
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
      id="delete-manager"
      title={`Tem certeza que deseja apagar o gerente?`}
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4">
        <Button onClick={() => closeModal("delete-manager")} variant="outline">
          Cancelar
        </Button>
        <ProtectedAction>
          <Button
            disabled={isPending}
            variant="destructive"
            onClick={() => handleDelete(currentManager?.id!)}
          >
            {isPending ? "Apagando..." : "Apagar"}
          </Button>
        </ProtectedAction>
      </div>
    </GlobalModal>
  );
}
