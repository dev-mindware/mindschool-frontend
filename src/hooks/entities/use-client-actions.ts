import { useModal } from "@/stores/modal/use-modal-store";
import { ClientResponse } from "@/types";
import { currentClientStore } from "@/stores/entities";
import { useToggleStatusClient } from "./use-clients";
import { ErrorMessage } from "@/utils";

export function useClientActions() {
  const { openModal } = useModal();
  const { setCurrentClient } = currentClientStore();
  const { mutateAsync: toggleStatusClient } = useToggleStatusClient();

  function handlerEditClient(client: ClientResponse) {
    openModal("edit-client");
    setCurrentClient(client);
  }

  function handlerDetailsClient(client: ClientResponse) {
    openModal("view-client");
    setCurrentClient(client);
  }

  function handlerDeleteClient(client: ClientResponse) {
    openModal("delete-client");
    setCurrentClient(client);
  }

   async function handlerToggleStatusClient(client: ClientResponse) {
     try {
       setCurrentClient(client);
       await toggleStatusClient(client.id);
     } catch (error: any) {
       if (error?.response?.data) {
         ErrorMessage(error?.response?.data?.message || "Erro inesperado");
       } else {
         ErrorMessage("Erro Desconhecido. Tente novamente.");
       }
     }
   }

  return {
    handlerDeleteClient,
    handlerDetailsClient,
    handlerEditClient,
    handlerToggleStatusClient,
  };
}
