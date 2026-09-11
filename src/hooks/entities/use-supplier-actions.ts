import { SupplierResponse } from "@/types";
import { useModal } from "@/stores/modal/use-modal-store";
import { currentSupplierStore } from "@/stores/entities";

export function useSupplierActions() {
  const { openModal } = useModal();
  const { setCurrentSupplier } = currentSupplierStore();

  function handlerEditSupplier(supplier: SupplierResponse) {
    openModal("edit-supplier");
    setCurrentSupplier(supplier);
  }

  function handlerDeleteSupplier(supplier: SupplierResponse) {
    openModal("delete-supplier");
    setCurrentSupplier(supplier);
  }

  function handlerRestockSupplier(supplier: SupplierResponse) {
    openModal("restock-supplier");
    setCurrentSupplier(supplier);
  }

  return {
    handlerDeleteSupplier,
    handlerEditSupplier,
    handlerRestockSupplier,
  };
}
