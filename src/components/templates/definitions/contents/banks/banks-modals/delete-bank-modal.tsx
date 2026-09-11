import { useDeleteBank } from "@/hooks/banks";
import { Button, GlobalModal } from "@/components";
import { currentBankStore } from "@/stores/banks";
import { useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";

export function DeleteBankModal() {
    const { closeModal, open } = useModal();
    const { currentBank } = currentBankStore();
    const { mutateAsync: deleteBankMutate, isPending } = useDeleteBank();

    async function handleDelete(id: string) {
        if (!currentBank) return;
        try {
            await deleteBankMutate(id);
            closeModal("delete-bank");
        } catch (error: any) {
            if (error?.response) {
                ErrorMessage(
                    error.response.data.message || "Erro ao remover o banco."
                );
            } else {
                ErrorMessage("Ocorreu um erro desconhecido. Tente novamente.");
            }
        }
    }

    if (!open["delete-bank"]) return null;

    return (
        <GlobalModal
            warning
            canClose
            className="!w-max"
            id="delete-bank"
            title="Tem certeza absoluta?"
            description="Tem certeza que deseja remover este banco? esta acção é irreversível"
        >
            <div className="flex justify-end gap-4">
                <Button onClick={() => closeModal("delete-bank")} variant="outline">
                    Cancelar
                </Button>
                <Button
                    disabled={isPending}
                    variant="destructive"
                    onClick={() => handleDelete(currentBank?.id!)}
                >
                    {isPending ? "Removendo..." : "Sim, remover banco"}
                </Button>
            </div>
        </GlobalModal>
    );
}
