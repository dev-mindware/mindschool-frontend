import { useDeleteCategory } from "@/hooks";
import { Button, GlobalModal } from "@/components";
import { currentCategoryStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage } from "@/utils/messages";

export function DeleteCategoryModal() {
  const { closeModal, open } = useModal();
  const { currentCategory } = currentCategoryStore();
  const { mutateAsync: deleteCategoryMutate, isPending } = useDeleteCategory();

  async function handleDelete(id: string) {
    if (!currentCategory) return;
    try {
      await deleteCategoryMutate(id);
      closeModal("delete-category");
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(
          error.response.data.message || "Erro ao apagar a categoria."
        );
      } else {
        ErrorMessage("Ocorreu um erro desconhecido. Tente novamente.");
      }
    }
  }


  if(!open["delete-category"]) return null;

  return (
    <GlobalModal
      warning
      canClose
      className="!w-max"
      id="delete-category"
      title="Tem certeza que deseja apagar a categoria?"
      description="Lembre-se que os proutos pertencentes a essa categoria serão apagados!"
    >
      <div className="flex justify-end gap-4">
        <Button onClick={() => closeModal("delete-category")} variant="outline">
          Cancelar
        </Button>
        <Button
          disabled={isPending}
          variant="destructive"
          onClick={() => handleDelete(currentCategory?.id!)}
        >
          {isPending ? "Apagando..." : "Apagar Categoria"}
        </Button>
      </div>
    </GlobalModal>
  );
}
