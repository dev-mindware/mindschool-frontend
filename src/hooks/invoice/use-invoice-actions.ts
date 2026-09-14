import { useModal } from "@/stores/modal/use-modal-store";
import { InvoiceResponse } from "@/types";
import { currentInvoiceStore } from "@/stores/documents";

export function useInvoiceActions() {
  const { openModal } = useModal();
  const { setCurrentInvoice } = currentInvoiceStore();

  function handlerDetailsInvoice(invoice: InvoiceResponse) {
    openModal("details-invoice");
    setCurrentInvoice(invoice);
  }

  function handlerCloneInvoice(invoice: InvoiceResponse) {
    openModal("clone-invoice");
    setCurrentInvoice(invoice);
  }

  return {
    handlerDetailsInvoice,
    handlerCloneInvoice,
  };
}
