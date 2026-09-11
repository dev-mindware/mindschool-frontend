import { useModal } from "@/stores/modal/use-modal-store";
import { InvoiceResponse } from "@/types";
import { currentInvoiceStore } from "@/stores/documents";
import { currentProformaStore } from "@/stores/documents";

export function useInvoiceActions() {
  const { openModal } = useModal();
  const { setCurrentInvoice } = currentInvoiceStore();

  function handlerGenerateReceipt(invoice: InvoiceResponse) {
    openModal("generate-receipt");
    setCurrentInvoice(invoice);
  }

  function handlerCancelInvoice(invoice: InvoiceResponse) {
    openModal("cancel-invoice");
    setCurrentInvoice(invoice);
  }

  function handlerDetailsInvoice(invoice: InvoiceResponse) {
    openModal("details-invoice");
    setCurrentInvoice(invoice);
  }

  function handlerCloneInvoice(invoice: InvoiceResponse) {
    openModal("clone-invoice");
    setCurrentInvoice(invoice);
  }

  return {
    handlerGenerateReceipt,
    handlerCancelInvoice,
    handlerDetailsInvoice,
    handlerCloneInvoice,
  };
}

