import { useModal } from "@/stores/modal/use-modal-store";
import { currentServiceStore } from "@/stores";
import { ItemResponse as Service } from "@/types";

export function useServiceActions() {
  const { openModal } = useModal();
  const { setCurrentService } = currentServiceStore();

  function handlerEditService(service: Service) {
    openModal("edit-service");
    setCurrentService(service);
  }

  function handlerDetailsService(service: Service) {
    openModal("view-service");
    setCurrentService(service);
  }

  function handlerDeleteService(service: Service) {
    openModal("delete-item");
    setCurrentService(service);
  }

  return {
    handlerDeleteService,
    handlerDetailsService,
    handlerEditService,
  };
}
