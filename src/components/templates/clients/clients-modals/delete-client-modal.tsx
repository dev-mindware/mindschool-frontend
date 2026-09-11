import { Button, GlobalModal } from "@/components";
import { currentClientStore } from "@/stores";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage } from "@/utils/messages";

export function DeleteClientModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-client"];
  const { currentClient } = currentClientStore();
  // const { mutateAsync: deleteItemMutate, isPending } = useDeleteClient();

  async function handleDelete(id: string) {
    if (!currentClient) return;
    try {
      //await deleteItemMutate(id);
      closeModal("delete-client");
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(
          error.response.data.message || `Erro ao apagar o cliente.`
        );
      } else {
        ErrorMessage(
          `Ocorreu um erro desconhecido ao apagar o cliente. Tente novamente.`
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
      id="delete-client"
      title={`Tem certeza que deseja apagar o cliente ${currentClient?.name}?`}
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4">
        <Button onClick={() => closeModal("delete-client")} variant="outline">
          Cancelar
        </Button>
        <Button
          /* disabled={isPending} */
          variant="destructive"
          onClick={() => handleDelete(currentClient?.id!)}
        >
          apagar
          {/* {isPending ? "Apagando..." : `Apagar ${currentClient?.name}`} */}
        </Button>
      </div>
    </GlobalModal>
  );
}
