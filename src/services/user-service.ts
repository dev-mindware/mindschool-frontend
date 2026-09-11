import type { User } from "@/types";
import { api } from "./api";

export interface UpdateUserPayload {
  name?: string;
  phone?: string;
  role?: string;
  companyId?: string;
  storeId?: string;
  storeIds?: string[];
  barcode?: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  barcode?: string;
}

export interface ChangeUserPasswordPayload {
  newPassword?: string;
}

export const userService = {
  updateUser: async (id: string, data: UpdateUserPayload) => {
    return api.put<User>(`/users/${id}`, data);
  },
  updateProfile: async (data: UpdateUserProfilePayload) => {
    return api.put<User>(`/users/profile`, data);
  },
  changePassword: async (id: string, data: ChangeUserPasswordPayload) => {
    return api.patch<User>(`/users/${id}/change-password`, data);
  },
  getUserById: async (id: string) => {
    return api.get<User>(`/users/${id}`);
  },
  getUsers: async (params?: Record<string, any>) => {
    return api.get<any>(`/users`, { params });
  },
};
