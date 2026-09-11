"use client";

import { useModal } from "@/stores/modal/use-modal-store";
import { currentProformaStore } from "@/stores/documents";
import { DynamicDrawer } from "./index";
import { InvoiceTemplate } from "./templates/invoice-template";

export function ProformaPreviewDrawer() {
  const { open, closeModal } = useModal();
  const { currentProforma } = currentProformaStore();
  const isOpen = open["details-proforma"];

  if (!currentProforma) return null;

  return (
    <DynamicDrawer
      open={!!isOpen}
      onOpenChange={(val) => !val && closeModal("details-proforma")}
      title="Pré-visualização da Proforma"
      description={`Detalhes da proforma ${currentProforma.number}`}
    >
      <InvoiceTemplate type="proforma" data={currentProforma} />
    </DynamicDrawer>
  );
}
