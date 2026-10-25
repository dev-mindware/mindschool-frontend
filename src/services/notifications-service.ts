import api from "@/services/api";
import type { NotificationType } from "@/types";

interface ApiNotification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface Page {
  data: ApiNotification[];
  page: { limit: number; has_more: boolean; next_cursor: string | null };
}

const toNotification = (n: ApiNotification): NotificationType => ({
  id: n.id,
  title: n.title,
  message: n.body ?? "",
  type: "INFO",
  userId: "",
  isRead: n.read,
  createdAt: n.created_at,
});

export const notificationsService = {
  /** Feed in-app do utilizador na escola ativa (`GET /schools/:id/notifications`), paginado por cursor. */
  page: async (params: { cursor?: string | null; unread?: boolean; limit?: number }): Promise<{ data: NotificationType[]; nextCursor: string | null }> => {
    const { data } = await api.get<Page>("/s/notifications", {
      params: { limit: params.limit ?? 20, ...(params.cursor ? { cursor: params.cursor } : {}), ...(params.unread ? { unread: "true" } : {}) },
    });
    return { data: data.data.map(toNotification), nextCursor: data.page.has_more ? data.page.next_cursor : null };
  },
  unreadCount: async (): Promise<number> => (await api.get<{ unread: number }>("/s/notifications/unread-count")).data.unread,
  markAsRead: async (id: string) => {
    await api.post(`/s/notifications/${id}/read`, {});
  },
  markAllAsRead: async () => {
    await api.post("/s/notifications/read-all", {});
  },
};
