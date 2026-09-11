import { create } from "zustand";
import { NotificationType } from "@/types";

interface NotificationState {
  currentNotification: NotificationType | null;
  setCurrentNotification: (notification: NotificationType | null) => void;
}

export const useCurrentNotificationStore = create<NotificationState>((set) => ({
  currentNotification: null,
  setCurrentNotification: (notification) => set({ currentNotification: notification }),
}));
