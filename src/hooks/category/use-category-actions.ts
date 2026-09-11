import { Category } from "@/types";
import { useModal } from "@/stores/modal/use-modal-store";
import { currentCategoryStore } from "@/stores";
import { useToggleStatusCategory } from "./use-category";
import { ErrorMessage } from "@/utils/messages";

export function useCategoryActions() {
  const { openModal } = useModal();
  const { setCurrentCategory } = currentCategoryStore();
  const { mutateAsync: toggleStatus, isPending: isUpdating } = useToggleStatusCategory();

  function handlerEditCategory(category: Category) {
    setCurrentCategory(category);
    openModal("edit-category");
  }

  function handlerDetailsCategory(category: Category) {
    setCurrentCategory(category);
    openModal("view-category");
  }

  function handlerDeleteCategory(category: Category) {
    setCurrentCategory(category);
    openModal("delete-category");
  }

  async function toggleStatusCategory(category: Category) {
    try {
      setCurrentCategory(category);
      await toggleStatus(category.id);
    } catch (error: any) {
      if (error?.response?.data) {
        ErrorMessage(error?.response?.data?.message || "Erro inesperado");
      } else {
        ErrorMessage("Erro Desconhecido. Tente novamente.");
      }
    }
  }

  return {
    isUpdating,
    handlerDeleteCategory,
    handlerDetailsCategory,
    handlerEditCategory,
    toggleStatusCategory,
  };
}
