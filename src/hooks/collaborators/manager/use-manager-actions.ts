import { useModal } from "@/stores/modal/use-modal-store";
import { ManagerResponse } from "@/types";
import { currentManagerStore } from "@/stores/collaborators";
import { useToggleStatusManager } from "./use-manager";

export function useManagerActions() {
  const { openModal } = useModal();
  const { setCurrentManager } = currentManagerStore();

  const { mutateAsync: toggleStatus } = useToggleStatusManager();

  function handlerEditManager(manager: ManagerResponse) {
    openModal("edit-manager");
    setCurrentManager(manager);
  }

  function handlerDetailsManager(manager: ManagerResponse) {
    openModal("view-manager");
    setCurrentManager(manager);
  }

  function handlerDeleteManager(manager: ManagerResponse) {
    openModal("delete-manager");
    setCurrentManager(manager);
  }

  async function handlerToggleStatusManager(manager: ManagerResponse) {
    try {
      await toggleStatus(manager.id);
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  return {
    handlerDeleteManager,
    handlerDetailsManager,
    handlerEditManager,
    handlerToggleStatusManager,
  };
}
