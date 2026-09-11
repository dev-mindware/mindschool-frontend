"use client";

import { useModal } from "@/stores/modal/use-modal-store";
import { currentReceiptStore } from "@/stores/documents";
import { DynamicDrawer } from "./index";
import { ReceiptTemplate } from "./templates/receipt-template";

export function ReceiptPreviewDrawer() {
  const { open, closeModal } = useModal();
  const { currentReceipt } = currentReceiptStore();
  const isOpen = open["details-receipt"];

  if (!currentReceipt) return null;

  return (
    <DynamicDrawer
      open={!!isOpen}
      onOpenChange={(val) => !val && closeModal("details-receipt")}
      title="Pré-visualização do Recibo"
      description={`Detalhes do recibo ${currentReceipt.number}`}
    >
      <ReceiptTemplate data={currentReceipt} />
    </DynamicDrawer>
  );
}
