import { useModal } from "@/stores/modal/use-modal-store";
import { InvoiceResponse } from "@/types";
import { currentInvoiceStore } from "@/stores/documents";
import { currentProformaStore } from "@/stores/documents";

export function useProformaActions() {
  const { openModal } = useModal();
  const { setCurrentProforma } = currentProformaStore();

  function handlerDeleteProforma(proforma: InvoiceResponse) {
    openModal("delete-proforma");
    setCurrentProforma(proforma);
  }

  function handlerDetailsProforma(proforma: InvoiceResponse) {
    openModal("details-proforma");
    setCurrentProforma(proforma);
  }

  function hanlderEditProforma(proforma: InvoiceResponse) {
    openModal("edit-proforma");
    setCurrentProforma(proforma);
  }

  function handlerConvertProforma(proforma: InvoiceResponse) {
    setCurrentProforma(proforma);
    openModal("convert-proforma");
  }

  return {
    handlerDeleteProforma,
    handlerDetailsProforma,
    hanlderEditProforma,
    handlerConvertProforma,
  };
}
