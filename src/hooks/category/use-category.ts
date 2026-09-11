"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePagination } from "../common/use-pagination";
import { useLocalPagination } from "../common/use-local-pagination";
import { Category, CategoryData } from "@/types/category";
import { currentStoreStore } from "@/stores";
import { categoryService } from "@/services/category-service";
import { SucessMessage } from "@/utils/messages";

export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryData) => categoryService.addCategory(data),
    onSuccess: () => {
      SucessMessage("Categoria adicionada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories_select"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryData }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      SucessMessage("Categoria actualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories_select"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      SucessMessage("Categoria removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories_select"] });
    },
  });
}

export function useToggleStatusCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.toggleStatusCategory(id),
    onSuccess: () => {
      SucessMessage("Status da categoria alterado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories_select"] });
    },
  });
}

export function useGetCategories() {
  const { currentStore } = currentStoreStore();

  const pagination = usePagination<Category>({
    endpoint: "/categories",
    queryKey: "categories",
    queryParams: {
      storeId: currentStore?.id,
    },
    enabled: !!currentStore?.id,
  });

  const categoryOptions = pagination.data.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return {
    ...pagination,
    categoryOptions,
    categories: pagination.data,
    // Backward compatibility
    error: pagination.isError,
    pagination: {
      page: pagination.page,
      totalPages: pagination.totalPages,
      total: pagination.total,
    },
  };
}

export function useCategoriesSelect() {
  const { currentStore } = currentStoreStore();

  const pagination = useLocalPagination<Category>({
    endpoint: "/categories",
    queryKey: "categories_select",
    queryParams: {
      storeId: currentStore?.id,
    },
    enabled: !!currentStore?.id,
  });

  const categoryOptions = pagination.data.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return {
    ...pagination,
    categoryOptions,
    categories: pagination.data,
    pagination: {
      page: pagination.page,
      totalPages: pagination.totalPages,
      total: pagination.total,
    },
  };
}
