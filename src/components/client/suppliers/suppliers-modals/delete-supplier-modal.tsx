import { Button, GlobalModal, ProtectedAction } from "@/components";
import { useDeleteSupplier } from "@/hooks/entities/use-suppliers";
import { currentSupplierStore } from "@/stores/entities/current-supplier-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage } from "@/utils/messages";

export function DeleteSupplierModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-supplier"];
  const { currentSupplier } = currentSupplierStore();
  const { mutateAsync: deleteItemMutate, isPending } = useDeleteSupplier();

  async function handleDelete(id: string) {
    if (!currentSupplier) return;
    try {
      await deleteItemMutate(id);
      closeModal("delete-supplier");
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(
          error.response.data.message || `Erro ao apagar o fornecedor.`
        );
      } else {
        ErrorMessage(
          `Ocorreu um erro desconhecido ao apagar o fornecedor. Tente novamente.`
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
      id="delete-supplier"
      title={`Tem certeza que deseja apagar o fornecedor ${currentSupplier?.name}?`}
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4">
        <Button onClick={() => closeModal("delete-supplier")} variant="outline">
          Cancelar
        </Button>
        <ProtectedAction>
          <Button
            disabled={isPending}
            variant="destructive"
            onClick={() => handleDelete(currentSupplier?.id!)}
          >
            {isPending ? "Apagando..." : `Apagar ${currentSupplier?.name}`}
          </Button>
        </ProtectedAction>
      </div>
    </GlobalModal>
  );
}
