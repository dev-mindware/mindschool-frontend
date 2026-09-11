"use client";

import { Button, GlobalModal } from "@/components";
import { useModal } from "@/stores";
import { useCurrentCashierStore } from "@/stores/pos/current-cashier-store";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { useDeleteCashSession } from "@/hooks/entities";

export function PosDeleteModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["delete-cashier"];
  const { currentCashier, setCurrentCashier } = useCurrentCashierStore();
  const { mutateAsync: deleteSessionMutate, isPending } = useDeleteCashSession();

  const handleDelete = async () => {
    if (!currentCashier) return;

    try {
      await deleteSessionMutate(currentCashier.id);
      setCurrentCashier(null);
      closeModal("delete-cashier");
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!isOpen) return null;

  return (
    <GlobalModal
      warning
      canClose
      className="!w-max"
      id="delete-cashier"
      title={`Tem certeza que deseja apagar a sessão de ${currentCashier?.user?.name || "Operador"}?`}
      description="Esta acção não pode ser anulada."
    >
      <div className="flex justify-end gap-4 pt-4">
        <Button
          onClick={() => {
            closeModal("delete-cashier");
            setCurrentCashier(null);
          }}
          variant="outline"
        >
          Cancelar
        </Button>
        <Button
          loading={isPending}
          variant="destructive"
          onClick={handleDelete}
        >
          {isPending ? "Apagando..." : "Apagar Sessão"}
        </Button>
      </div>
    </GlobalModal>
  );
}
