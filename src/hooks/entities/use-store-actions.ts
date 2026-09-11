import { StoreResponse } from "@/types";
import { currentStoreStore } from "@/stores/entities/current-store-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { useToggleStatusStore } from "./use-stores";

export function useStoreActions() {
  const { openModal } = useModal();
  const { setCurrentStore } = currentStoreStore();
  const { mutateAsync: toggleStatus } = useToggleStatusStore();

  function handlerEditStore(store: StoreResponse) {
    openModal("edit-store");
    setCurrentStore(store);
  }

  function handlerDetailsStore(store: StoreResponse) {
    openModal("view-store");
    setCurrentStore(store);
  }

  function handlerDeleteStore(store: StoreResponse) {
    openModal("delete-store");
    setCurrentStore(store);
  }

  async function toggleStatusStore(store: StoreResponse) {
    setCurrentStore(store);
    await toggleStatus(store.id);
  }

  return {
    handlerDeleteStore,
    handlerDetailsStore,
    handlerEditStore,
    toggleStatusStore,
  };
}
