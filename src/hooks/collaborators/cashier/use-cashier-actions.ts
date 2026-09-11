import { CashierResponse } from "@/types";
import { useModal } from "@/stores/modal/use-modal-store";
import { useToggleStatusCashier } from "./use-cashier";
import { currentCashierStore } from "@/stores/collaborators";

export function useCashierActions() {
  const { openModal } = useModal();
  const { setCurrentCashier } = currentCashierStore();
  const { mutateAsync: toggleStatus } = useToggleStatusCashier();

  function handlerEditCashier(cashier: CashierResponse) {
    openModal("edit-cashier");
    setCurrentCashier(cashier);
  }

  function handlerDetailsCashier(cashier: CashierResponse) {
    openModal("view-cashier");
    setCurrentCashier(cashier);
  }

  function handlerDeleteCashier(cashier: CashierResponse) {
    openModal("delete-cashier");
    setCurrentCashier(cashier);
  }

  async function toggleStatusCashier(cashier: CashierResponse) {
    setCurrentCashier(cashier);
    await toggleStatus(cashier.id);
  }

  return {
    handlerDeleteCashier,
    handlerDetailsCashier,
    handlerEditCashier,
    toggleStatusCashier,
  };
}
