import { Bank } from "@/types";
import { useModal } from "@/stores/modal/use-modal-store";
import { currentBankStore } from "@/stores/banks";

export function useBanksActions() {
  const { openModal } = useModal();
  const { setCurrentBank } = currentBankStore();

  function handlerDeletebank(bank: Bank) {
    openModal("delete-bank");
    setCurrentBank(bank);
  }

  function handlerDetailsBank(bank: Bank) {
    openModal("details-bank");
    setCurrentBank(bank);
  }

  function handlerAddBank() {
    setCurrentBank(undefined);
    openModal("add-bank");
  }

  function handlerEditBank(bank: Bank) {
    setCurrentBank(bank);
    openModal("edit-bank");
  }

  return {
    handlerDeletebank,
    handlerDetailsBank,
    handlerAddBank,
    handlerEditBank,
  };
}
