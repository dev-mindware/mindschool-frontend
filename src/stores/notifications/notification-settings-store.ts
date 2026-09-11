import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationSettingsState {
  soundEnabled: boolean;
  soundType: string;
  browserNotificationsEnabled: boolean;
  badgeEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundType: (type: string) => void;
  setBrowserNotificationsEnabled: (enabled: boolean) => void;
  setBadgeEnabled: (enabled: boolean) => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      soundType: "/sound-effects/notification-1.mp3",
      browserNotificationsEnabled: false,
      badgeEnabled: true,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundType: (type) => set({ soundType: type }),
      setBrowserNotificationsEnabled: (enabled) =>
        set({ browserNotificationsEnabled: enabled }),
      setBadgeEnabled: (enabled) => set({ badgeEnabled: enabled }),
    }),
    {
      name: "notification-settings",
      version: 3,
      migrate: (persistedState: any) => {
        let sound = persistedState?.soundType ?? "/sound-effects/notification-1.mp3";
        if (sound === "/notification-1.mp3") sound = "/sound-effects/notification-1.mp3";
        if (sound === "/notification-2.mp3") sound = "/sound-effects/notification-2.mp3";
        if (sound === "/notification-3.mp3") sound = "/sound-effects/notification-3.mp3";

        return {
          soundEnabled: persistedState?.soundEnabled ?? true,
          soundType: sound,
          browserNotificationsEnabled: Boolean(persistedState?.browserNotificationsEnabled),
          badgeEnabled: persistedState?.badgeEnabled ?? true,
        };
      },
    },
  ),
);
