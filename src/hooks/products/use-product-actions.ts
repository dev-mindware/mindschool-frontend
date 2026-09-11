import { useModal } from "@/stores/modal/use-modal-store";
import { ItemResponse as Product } from "@/types";
import { currentProductStore } from "@/stores/products";
import { useToggleStatusItem } from "../items";

export function useProductActions() {
  const { openModal } = useModal();
  const { setCurrentProduct } = currentProductStore();
  const { mutateAsync: toggleStatus, isPending: isTogglingStatus } = useToggleStatusItem()

  function handlerEditProduct(product: Product) {
    openModal("edit-product");
    setCurrentProduct(product);
  }

  function handlerDetailsProduct(product: Product) {
    openModal("view-product");
    setCurrentProduct(product);
  }

  function handlerDeleteProduct(product: Product) {
    openModal("delete-item");
    setCurrentProduct(product);
  }

  async function toggleStatusProduct(product: Product) {
    setCurrentProduct(product);
    await toggleStatus(product.id);
  }

  return {
    handlerDeleteProduct,
    handlerDetailsProduct,
    handlerEditProduct,
    toggleStatusProduct,
    isTogglingStatus,
  };
}
