import { api } from "@/services/api";
import { NotificationParams, NotificationType } from "@/types";

export interface GetNotificationsResponse {
  data: NotificationType[];
  total: number;
}

export const notificationsService = {
  getNotifications: async (params: NotificationParams): Promise<GetNotificationsResponse> => {
    const response = await api.get<NotificationType[]>("/notifications", {
      params,
    });

    return {
      data: response.data,
      total: 0 
    };
  },

  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },

  deleteNotification: async (id: string) => {
    await api.delete(`/notifications/${id}`);
  }
};
