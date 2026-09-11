import { useModal } from "@/stores/modal/use-modal-store";
import { ReceiptResponse } from "@/types/receipt";
import { currentReceiptStore } from "@/stores/documents";

export function useReceiptActions() {
  const { openModal } = useModal();
  const { setCurrentReceipt } = currentReceiptStore();

  function handlerDetailsReceipt(receipt: ReceiptResponse) {
    openModal("details-receipt");
    setCurrentReceipt(receipt);
  }

  return {
    handlerDetailsReceipt,
  };
}
