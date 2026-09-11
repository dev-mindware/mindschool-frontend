import { useModal } from "@/stores/modal/use-modal-store";
import { InvoiceResponse } from "@/types";
import { currentCreditNoteStore } from "@/stores/documents";
import { CreditNotesResponse } from "@/types/credit-note";

export function useCreditNotesActions() {
  const { openModal } = useModal();
  const { setCurrentCreditNote } = currentCreditNoteStore();
  
  function handlerDetailsCreditNote(creditNote: CreditNotesResponse) {
    openModal("details-credit-note");
    setCurrentCreditNote(creditNote);
  }

  return {
    handlerDetailsCreditNote,
  };
}
