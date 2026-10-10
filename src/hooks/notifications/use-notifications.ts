"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/stores/modal/use-modal-store";
import { playSoundEffect, primeAudioPlayback } from "@/utils";
import { useCurrentNotificationStore, useNotificationSettingsStore } from "@/stores";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { NotificationParams, NotificationType } from "@/types/notification";
import { notificationsService } from "@/services/notifications-service";
import { notificationAlertState } from "./notification-alert-state";

/**
 * Notificacoes in-app da escola activa (API `notifications`): lista paginada por cursor, contador de nao lidas e
 * alerta sonoro/do navegador quando chega uma nova (consulta periodica).
 */
export function useNotifications(initialFilters: Omit<NotificationParams, "skip" | "take"> = {}) {
  const queryClient = useQueryClient();
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const unreadOnly = initialFilters.isRead === false;
  const queryKey = useMemo(() => ["notifications", schoolId, unreadOnly] as const, [schoolId, unreadOnly]);
  const { openModal } = useModal();
  const { setCurrentNotification } = useCurrentNotificationStore();
  const { soundEnabled, soundType, browserNotificationsEnabled } = useNotificationSettingsStore();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const soundEnabledRef = useRef(soundEnabled);
  const soundTypeRef = useRef(soundType);
  const browserRef = useRef(browserNotificationsEnabled);
  const baselineRef = useRef(false);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { soundTypeRef.current = soundType; }, [soundType]);
  useEffect(() => { browserRef.current = browserNotificationsEnabled; }, [browserNotificationsEnabled]);
  useEffect(() => { void primeAudioPlayback(soundType); }, [soundType]);

  const alertForNew = useCallback(async (n: NotificationType) => {
    if (!notificationAlertState.shouldAlert(n.id)) return;
    if (soundEnabledRef.current) await playSoundEffect(soundTypeRef.current, 0.5);
    if (browserRef.current && typeof Notification !== "undefined" && Notification.permission === "granted") {
      const b = new Notification(n.title, { body: n.message, icon: "/favicon.ico", tag: n.id });
      b.onclick = () => { window.focus(); b.close(); };
    }
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error, refetch } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => notificationsService.page({ cursor: pageParam as string | null, unread: unreadOnly }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    enabled: Boolean(schoolId),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });

  const notifications = (data?.pages.flatMap((p) => p.data) ?? []).filter((n) => !dismissed.has(n.id));

  useEffect(() => {
    if (!data) return;
    const first = data.pages[0]?.data ?? [];
    if (!baselineRef.current) {
      notificationAlertState.establishBaseline(first.map((n) => n.id));
      baselineRef.current = true;
      return;
    }
    first.filter((n) => !n.isRead).forEach((n) => void alertForNew(n));
  }, [data, alertForNew]);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread", schoolId],
    queryFn: notificationsService.unreadCount,
    enabled: Boolean(schoolId),
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["notifications-unread", schoolId] });
  };

  const { mutateAsync: markAsRead } = useMutation({ mutationFn: notificationsService.markAsRead, onSettled: invalidate });
  const { mutateAsync: markAllAsRead } = useMutation({ mutationFn: notificationsService.markAllAsRead, onSettled: invalidate });

  // A API nao apaga notificacoes: "remover" marca como lida e esconde-a nesta sessao.
  const deleteNotification = useCallback(
    async (id: string) => {
      setDismissed((cur) => new Set(cur).add(id));
      await markAsRead(id);
    },
    [markAsRead],
  );

  const handleNotificationClick = (notification: NotificationType) => {
    openModal("notify-detail");
    setCurrentNotification(notification);
    if (!notification.isRead) void markAsRead(notification.id);
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
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
    refetch,
    unreadCount,
  };
}
