"use client";

import { DynamicDrawer } from "./index";
import { useModal } from "@/stores/modal/use-modal-store";
import { currentCreditNoteStore } from "@/stores/documents";
import { InvoiceTemplate } from "./templates/invoice-template";
import { CreditNoteTemplate } from "./templates";

export function CreditNotePreviewDrawer() {
  const { open, closeModal } = useModal();
  const { currentCreditNote } = currentCreditNoteStore();
  const isOpen = open["details-credit-note"];

  if (!currentCreditNote) return null;

  return (
    <DynamicDrawer
      open={!!isOpen}
      onOpenChange={(val) => !val && closeModal("details-credit-note")}
      title="Pré-visualização da Nota de Crédito"
      description={`Detalhes da nota de crédito ${currentCreditNote.number}`}
    >
      <CreditNoteTemplate data={currentCreditNote} />
    </DynamicDrawer>
  );
}
