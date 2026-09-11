import { useDeleteItem } from "@/hooks";
import { Button, GlobalModal } from "@/components";
import { currentProductStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage } from "@/utils/messages";
import { extractErrorMessage } from "@/utils/error-handler";

export function DeleteItemModal({ type }: { type: string }) {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-item"];
  const { currentProduct } = currentProductStore();
  const { mutateAsync: deleteItemMutate, isPending } = useDeleteItem();

  async function handleDelete(id: string) {
    if (!currentProduct) return;
    try {
      await deleteItemMutate(id);
      closeModal("delete-product");
    } catch (error: unknown) {
      ErrorMessage(
        extractErrorMessage(error, "Não foi possível remover o item. Tente novamente.")
      );
    }
  }

  if (!isOpen) return null;

  return (
    <GlobalModal
      warning
      canClose
      className="!w-max"
      id="delete-item"
      title={`Tem certeza que deseja apagar o ${type}?`}
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4">
        <Button onClick={() => closeModal("delete-item")} variant="outline">
          Cancelar
        </Button>
        <Button
          disabled={isPending}
          variant="destructive"
          onClick={() => handleDelete(currentProduct?.id!)}
        >
          {isPending ? "Apagando..." : `Apagar ${type}`}
        </Button>
      </div>
    </GlobalModal>
  );
}
