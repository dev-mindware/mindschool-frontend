"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationList } from "./notification-list";
import { useNotifications } from "@/hooks/notifications/use-notifications";
import { useNotificationSettingsStore } from "@/stores";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const badgeEnabled = useNotificationSettingsStore(
    (state) => state.badgeEnabled,
  );
  const {
    notifications,
    handleNotificationClick,
    deleteNotification,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative  hover:bg-primary-50"
          aria-label="Abrir notificações"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {badgeEnabled && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0 shadow-lg border-border"
        sideOffset={8}
      >
        <NotificationList
          isDropdown
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          notifications={notifications}
          isFetchingNextPage={isFetchingNextPage}
          deleteNotification={deleteNotification}
          onNotificationClick={handleNotificationClick}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
