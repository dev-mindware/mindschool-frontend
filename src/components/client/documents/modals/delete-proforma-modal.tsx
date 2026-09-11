import { ErrorMessage } from "@/utils/messages";
import { currentProformaStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { Button, GlobalModal } from "@/components";
import { useDeleteProforma } from "@/hooks/invoice-proforma";

export function DeleteProformaModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-proforma"];
  const { mutateAsync: deleteProforma, isPending } = useDeleteProforma();
  const { currentProforma } = currentProformaStore();

  async function handlerDeleteProforma() {
    if (!currentProforma?.id) {
      ErrorMessage("Proforma não seleccionada");
      return;
    }

    try {
      await deleteProforma(currentProforma.id);
      handleClose();
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(
          error?.response?.data?.message || "Não foi possível apagar a proforma."
        );
      } else {
        ErrorMessage("Ocorreu um erro desconhecido");
      }
    }
  }
  const handleClose = () => {
    closeModal("delete-proforma");
  };

  if (!isOpen) return null;

  return (
    <GlobalModal
      warning
      canClose
      className="!w-max"
      id="delete-proforma"
      title="Tem certeza que deseja apagar a proforma?"
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4">
        <Button
          disabled={isPending}
          className="disable:cursor-not-alowed"
          onClick={handleClose}
          variant="outline"
        >
          Cancelar
        </Button>

        <Button
          disabled={isPending}
          variant="destructive"
          className="w-max bg-destructive hover:bg-destructive/90"
          onClick={handlerDeleteProforma}
        >
          {isPending ? "Apagando..." : "Apagar Proforma"}
        </Button>
      </div>
    </GlobalModal>
  );
}
