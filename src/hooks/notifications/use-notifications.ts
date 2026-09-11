"use client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useModal } from "@/stores/modal/use-modal-store";
import { playSoundEffect, primeAudioPlayback } from "@/utils";
import {
  useCurrentNotificationStore,
  useNotificationSettingsStore,
} from "@/stores";
import { NotificationParams, NotificationType } from "@/types/notification";
import { notificationsService } from "@/services/notifications-service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationAlertState } from "./notification-alert-state";

let socket: Socket;

export function useNotifications(
  initialFilters: Omit<NotificationParams, "skip" | "take"> = {},
) {
  const queryClient = useQueryClient();
  const filtersKey = JSON.stringify(initialFilters);
  const filters = useMemo(() => initialFilters, [filtersKey]);
  const queryKey = useMemo(() => ["notifications", filters] as const, [filters]);
  const { openModal } = useModal();
  const { setCurrentNotification } = useCurrentNotificationStore();
  const { soundEnabled, soundType, browserNotificationsEnabled } =
    useNotificationSettingsStore();

  const soundEnabledRef = useRef(soundEnabled);
  const soundTypeRef = useRef(soundType);
  const browserNotificationsEnabledRef = useRef(browserNotificationsEnabled);
  const hasEstablishedBaselineRef = useRef(false);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    soundTypeRef.current = soundType;
  }, [soundType]);

  useEffect(() => {
    browserNotificationsEnabledRef.current = browserNotificationsEnabled;
  }, [browserNotificationsEnabled]);

  useEffect(() => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      !browserNotificationsEnabled
    ) {
      useNotificationSettingsStore.setState({
        browserNotificationsEnabled: true,
      });
    }
  }, [browserNotificationsEnabled]);

  useEffect(() => {
    void primeAudioPlayback(soundType);
  }, [soundType]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlockAudio = async () => {
      await primeAudioPlayback(soundTypeRef.current);
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const playNotificationSound = useCallback(async () => {
    if (!soundEnabledRef.current) return;

    const didPlay = await playSoundEffect(soundTypeRef.current, 0.5);
    if (!didPlay) {
      console.warn("Navegador não permitiu reproduzir o som da notificação.");
    }
  }, []);

  const showBrowserNotification = useCallback((notification: NotificationType) => {
    if (
      !browserNotificationsEnabledRef.current ||
      typeof Notification === "undefined" ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico",
      tag: notification.id,
    });

    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
    };
  }, []);

  const alertForNewNotification = useCallback(
    (notification: NotificationType) => {
      if (!notificationAlertState.shouldAlert(notification.id)) return;

      void playNotificationSound();
      showBrowserNotification(notification);
    },
    [playNotificationSound, showBrowserNotification],
  );

  const TAKE = 5;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) =>
      notificationsService.getNotifications({
        ...filters,
        skip: pageParam as number,
        take: TAKE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < TAKE) return undefined;
      return allPages.length * TAKE;
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 5,
  });

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    if (!data || hasEstablishedBaselineRef.current) return;

    const existingIds = data.pages.flatMap((page) =>
      page.data.map((notification) => notification.id),
    );

    notificationAlertState.establishBaseline(existingIds);
    hasEstablishedBaselineRef.current = true;
  }, [data]);

  useEffect(() => {
    if (!notificationAlertState.isBaselineEstablished()) return;

    notifications.forEach((notification) => {
      alertForNewNotification(notification);
    });
  }, [notifications, alertForNewNotification]);

  useEffect(() => {
    let isSubscribed = true;
    let activeSocket: Socket | null = null;

    const setupSocket = async () => {
      try {
        const rawUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://mindgest.mindware-vps.cloud/api";
        let socketUrl = rawUrl;
        try {
          const parsed = new URL(rawUrl);
          socketUrl = `${parsed.origin}/notifications`;
        } catch {
          socketUrl = `${rawUrl.replace(/\/api\/?$/, "")}/notifications`;
        }

        let token: string | null = null;
        try {
          const { getAccessToken } = await import("@/actions/token");
          token = await getAccessToken();
        } catch (tokenErr) {
          console.warn("Could not retrieve access token for socket:", tokenErr);
        }

        if (!isSubscribed) return;

        activeSocket = io(socketUrl, {
          transports: ["websocket", "polling"],
          auth: token ? { token } : undefined,
          query: token ? { token } : undefined,
        });

        activeSocket.on("connect", () => {
          console.log("Connected to notification socket");
        });

        const handleIncomingNotification = (newNotification: NotificationType) => {
          if (!newNotification || !newNotification.id) return;

          queryClient.invalidateQueries({ queryKey: ["opening-requests"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          alertForNewNotification(newNotification);

          queryClient.setQueryData<any>(
            queryKey,
            (oldData: any) => {
              if (!oldData) return oldData;
              const newPages = [...oldData.pages];
              if (newPages.length > 0) {
                const firstPage = (newPages[0].data || []) as NotificationType[];
                if (firstPage.some((n) => n.id === newNotification.id)) {
                  return oldData;
                }

                newPages[0] = {
                  ...newPages[0],
                  data: [newNotification, ...firstPage],
                };
              }
              return { ...oldData, pages: newPages };
            },
          );
        };

        activeSocket.on("notification", handleIncomingNotification);
        activeSocket.on("new_notification", handleIncomingNotification);
      } catch (err) {
        console.warn("Socket initialization error:", err);
      }
    };

    void setupSocket();

    return () => {
      isSubscribed = false;
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [alertForNewNotification, queryClient, queryKey]);

  // Mutations
  const { mutateAsync: markAsRead } = useMutation({
    mutationFn: notificationsService.markAsRead,
    onMutate: async (id) => {
      // Optimistic update would be complex with infinite pages, disabling for simplicity or implementing basic toggle
      // For now, simpler to just invalidate or manually update if critical.
      // Let's manually update cache for responsiveness

      queryClient.setQueryData<any>(
        queryKey,
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((n: NotificationType) =>
                n.id === id ? { ...n, isRead: true } : n,
              ),
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Optional: Re-fetch to confirm
    },
  });

  const { mutateAsync: deleteNotification } = useMutation({
    mutationFn: notificationsService.deleteNotification,
    onMutate: async (id) => {
      queryClient.setQueryData<any>(
        queryKey,
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.filter((n: NotificationType) => n.id !== id),
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (notification: NotificationType) => {
    openModal("notify-detail");
    setCurrentNotification(notification);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  return {
    notifications,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead,
    deleteNotification,
    handleNotificationClick,
    refetch,
    unreadCount:
      data?.pages[0]?.data.filter((n) => n.isRead === false).length || 0, // Abordagem provisória, idealmente a API devia enviar isto global
  };
}
