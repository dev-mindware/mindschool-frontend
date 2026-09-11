"use client";
import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks";
import { TitleList, Button, Icon } from "@/components";
import { AllNotificationsSkeleton } from "@/components/common/skeletons";
import { NotificationList } from "./notification-list";
import { NotificationFilters } from "./notification-filters";
import Link from "next/link";
import { NotificationParams } from "@/types/notification";

export function AllNotifications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "read" | "unread">(
    "all",
  );
  const [filterType, setFilterType] = useState<
    "all" | "INFO" | "WARNING" | "ERROR" | "SUCCESS" | "AI_ALERT"
  >("all");

  const apiFilters = useMemo(() => {
    const filters: Omit<NotificationParams, "skip" | "take"> = {};
    if (filterStatus === "read") filters.isRead = true;
    if (filterStatus === "unread") filters.isRead = false;
    if (filterType !== "all") filters.type = filterType;
    return filters;
  }, [filterStatus, filterType]);

  const {
    notifications,
    isLoading,
    markAsRead,
    handleNotificationClick,
    deleteNotification,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications(apiFilters);

  if (isLoading) return <AllNotificationsSkeleton />;

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "all") return true;

    const rawType = String(n.type || "").toUpperCase();
    const isAiAlert =
      n.isAiAlert ||
      rawType === "AI_ALERT" ||
      n.title.toUpperCase().includes("MIND AI") ||
      n.title.toUpperCase().includes("ALERTA INTELIGENTE");

    if (filterType === "AI_ALERT") return isAiAlert;
    if (filterType === "SUCCESS") return rawType === "SUCCESS" || rawType === "SUCESSO";
    if (filterType === "WARNING") return rawType === "WARNING" || rawType === "ATENÇÃO";
    if (filterType === "ERROR") return rawType === "ERROR" || rawType === "ERRO";
    if (filterType === "INFO") return rawType === "INFO";

    return rawType === filterType;
  });

  const unreadCount = notifications.filter((n) => n.isRead === false).length;

  const handleMarkAllAsRead = () => {
    const unreadFiltered = notifications.filter((n) => n.isRead === false);
    unreadFiltered.forEach((n) => markAsRead(n.id));
  };

  return (
    <div className="space-y-6">
      <TitleList
        title="Notificações"
        suTitle="Mantenha-se actualizado sobre as suas actividades e mensagens"
      >
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Icon name="CheckCheck" className="mr-2 h-4 w-4" />
              Marcar tudo como lido
            </Button>
          )}
          <Link href="/settings?tab=notifications">
            <Button>
              <Icon name="Settings" className="mr-2 h-4 w-4" />
              Configurações
            </Button>
          </Link>
        </div>
      </TitleList>

      <NotificationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <NotificationList
          className="h-[calc(100vh-20rem)] min-h-[15rem]"
          notifications={filteredNotifications}
          onNotificationClick={handleNotificationClick}
          deleteNotification={deleteNotification}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      </div>
    </div>
  );
}
