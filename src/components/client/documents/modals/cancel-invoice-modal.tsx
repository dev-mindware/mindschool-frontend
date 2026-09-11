"use client";
import { ErrorMessage } from "@/utils/messages";
import { useModal, currentInvoiceStore } from "@/stores";
import { Button, ButtonSubmit, GlobalModal } from "@/components";
import { useCancelInvoice } from "@/hooks";
import { formatCurrency } from "@/utils";
import { FormEvent } from "react";

export function CancelInvoiceModal() {
  const { closeModal, open } = useModal();
  const isOpen = open["cancel-invoice"];
  const { currentInvoice } = currentInvoiceStore();
  const { mutateAsync: cancelInvoice, isPending } = useCancelInvoice();

  async function handleCancelInvoice(e: FormEvent) {
    e.preventDefault();
    
    if (!currentInvoice?.id) {
      ErrorMessage("Nenhuma factura seleccionada.");
      return;
    }

    try {
      await cancelInvoice(currentInvoice.id);
      handleClose();
    } catch (error: any) {
      if (error?.response) {
        ErrorMessage(
          error?.response?.data?.message || "Não foi possível cancelar a factura."
        );
      } else {
        ErrorMessage("Ocorreu um erro desconhecido");
      }
    }
  }

  const handleClose = () => {
    closeModal("cancel-invoice");
  };

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      id="cancel-invoice"
      title="Cancelar factura"
      className="!max-h-[85vh] !w-max"
    >
      <form onSubmit={handleCancelInvoice} className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem a certeza de que pretende cancelar a factura{" "}
            <strong>#{currentInvoice?.number}</strong>?
          </p>

          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">
                  {currentInvoice?.client?.name ?? currentInvoice?.clientId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">
                  {formatCurrency(currentInvoice?.total || "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <Button type="button" variant="outline" onClick={handleClose}>
            Voltar
          </Button>
          <ButtonSubmit
            isLoading={isPending}
            className="w-max bg-destructive hover:bg-destructive/90"
          >
            Cancelar factura
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
