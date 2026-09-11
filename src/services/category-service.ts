import { api } from "./api";
import type { CategoryData, CategoryResponse } from "@/types";

export const categoryService = {
  addCategory: async (data: CategoryData) => {
    return api.post<CategoryResponse>("/categories", data);
  },
  updateCategory: async (id: string, data: CategoryData) => {
    return api.put<CategoryResponse>(`/categories/${id}`, data);
  },
  toggleStatusCategory: async (id: string) => {
    return api.patch<CategoryResponse>(`/categories/${id}/toggle-status`);
  },
  deleteCategory: async (id: string) => {
    return api.delete<CategoryResponse>(`/categories/${id}`);
  },
};
