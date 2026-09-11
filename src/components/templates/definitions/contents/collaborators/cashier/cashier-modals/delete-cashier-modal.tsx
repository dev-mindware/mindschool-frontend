import { Button, GlobalModal, ProtectedAction } from "@/components";
import { useDeleteCashier } from "@/hooks/collaborators";
import { currentCashierStore } from "@/stores/collaborators";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage } from "@/utils/messages";

export function DeleteCashierModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-cashier"];
  const { currentCashier } = currentCashierStore();
  const { mutateAsync: deleteItemMutate, isPending } = useDeleteCashier();

  async function handleDelete(id: string) {
    if (!currentCashier) return;
    try {
      await deleteItemMutate(id);
      closeModal("delete-cashier");
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(
          error.response.data.message || `Erro ao apagar o caixa.`
        );
      } else {
        ErrorMessage(
          `Ocorreu um erro desconhecido ao apagar o caixa. Tente novamente.`
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
      id="delete-cashier"
      title={`Tem certeza que deseja apagar o caixa ${currentCashier?.name}?`}
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4">
        <Button
          onClick={() => closeModal("delete-cashier")}
          variant="outline"
        >
          Cancelar
        </Button>
        <ProtectedAction>
          <Button
            disabled={isPending}
            variant="destructive"
            onClick={() => handleDelete(currentCashier?.id!)}
          >
            {isPending ? "Apagando..." : `Apagar ${currentCashier?.name}`}
          </Button>
        </ProtectedAction>
      </div>
    </GlobalModal>
  );
}
