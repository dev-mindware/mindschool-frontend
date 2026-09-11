"use client";
import { useModal, currentInvoiceStore } from "@/stores";
import { Button, ButtonSubmit, GlobalModal } from "@/components";
import { useCreateInvoice } from "@/hooks/invoice";
import { formatCurrency } from "@/utils";
import { ErrorMessage } from "@/utils/messages";
import { FormEvent } from "react";
import { InvoiceResponse, InvoicePayload } from "@/types";

export const MODAL_CLONE_INVOICE_ID = "clone-invoice";

/** Mapeia os itens de uma InvoiceResponse para o payload aceite pela API.
 *  - Se o item veio do catálogo (tem itemsId) → envia apenas id + quantity.
 *  - Caso contrário → envia os dados inline (name, price, quantity, type). */
function mapInvoiceItems(items: InvoiceResponse["items"]): InvoicePayload["items"] {
  return items.map((item) => {
    if (item.itemsId) {
      return { id: item.itemsId, quantity: item.quantity };
    }
    return {
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
      type: (item.item?.type as "PRODUCT" | "SERVICE") ?? "PRODUCT",
    };
  });
}

export function CloneInvoiceModal() {
  const { closeModal, open } = useModal();
  const isOpen = open[MODAL_CLONE_INVOICE_ID];
  const { currentInvoice } = currentInvoiceStore();
  const { mutateAsync: createInvoice, isPending } = useCreateInvoice();

  async function handleClone(e: FormEvent) {
    e.preventDefault();

    if (!currentInvoice) {
      ErrorMessage("Nenhuma factura seleccionada.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    // Resolve o cliente: preferência pelo id do objecto `client`
    // (mais fiável que `clientId` que pode estar ausente).
    const client: InvoicePayload["client"] = currentInvoice.client?.id
      ? { id: currentInvoice.client.id }
      : {
          name: currentInvoice.client?.name ?? "",
          phone: currentInvoice.client?.phone ?? undefined,
          address: currentInvoice.client?.address ?? undefined,
        };

    const payload: InvoicePayload = {
      issueDate: today,
      // A nova factura vence hoje para não ser criada com o prazo expirado.
      // O utilizador poderá alterar depois.
      dueDate: today,
      client,
      items: mapInvoiceItems(currentInvoice.items),
      subtotal: Number(currentInvoice.subtotal),
      total: Number(currentInvoice.total),
      taxAmount: Number(currentInvoice.taxAmount),
      discountAmount: Number(currentInvoice.discountAmount),
      retentionAmount: Number(currentInvoice.receivedValue ?? 0),
      currencyCode: currentInvoice.currencyCode,
      notes: currentInvoice.notes ?? undefined,
      storeId: currentInvoice.storeId ?? undefined,
    };

    try {
      await createInvoice(payload);
      closeModal(MODAL_CLONE_INVOICE_ID);
    } catch (error: any) {
      ErrorMessage(
        error?.response?.data?.message ?? "Não foi possível duplicar a factura."
      );
    }
  }

  if (!isOpen) return null;

  return (
    <GlobalModal
      canClose
      id={MODAL_CLONE_INVOICE_ID}
      title="Duplicar factura"
      className="!max-h-[85vh] !w-max"
    >
      <form onSubmit={handleClone} className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pretende criar uma nova factura com os mesmos dados da factura{" "}
            <strong>#{currentInvoice?.number}</strong>?
          </p>

          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">
                  {currentInvoice?.client?.name ?? currentInvoice?.clientId ?? "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">
                  {formatCurrency(parseFloat(currentInvoice?.total as string) || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Itens:</span>
                <span className="font-medium">
                  {currentInvoice?.items?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal(MODAL_CLONE_INVOICE_ID)}
          >
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isPending} className="w-max">
            Duplicar factura
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
