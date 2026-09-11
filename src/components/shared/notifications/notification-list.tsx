"use client"
import { useEffect } from "react";
import { NotificationItem } from "./notification-item";
import { NotificationType } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInView } from "react-intersection-observer";
import { EmptyState } from "@/components/common";
import { cn } from "@/lib";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NotificationListProps {
  notifications: NotificationType[];
  onNotificationClick: (notification: NotificationType) => void;
  deleteNotification: (id: string) => void;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  className?: string;
  isDropdown?: boolean;
}

export function NotificationList({
  notifications,
  onNotificationClick,
  deleteNotification,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  className,
  isDropdown = false
}: NotificationListProps) {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const unreadNotifications = notifications.filter(
    (n) => !n.isRead
  );

  const pathname = usePathname();
  const isPos = pathname?.startsWith("/pos");

  return (
    <div className="w-full">
      {isDropdown && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          <Link href={isPos ? "/pos/notifications" : "/notifications"} className="text-primary text-sm">
            Ver todas
          </Link>
        </div>
      )}

      <ScrollArea
        className={cn(
          notifications.length === 0 ? "h-max" : className || "h-72",
        )}
      >
        {notifications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="BellOff"
              title="Sem notificações"
              className="border-none"
              description="Não existem novas notificações neste momento."
            />
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => onNotificationClick(notification)}
                onDelete={() => deleteNotification(notification.id)}
              />
            ))}

            {(hasNextPage || isFetchingNextPage) && (
              <div ref={ref} className="flex items-center justify-center p-4">
                {isFetchingNextPage ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <span className="text-xs text-muted-foreground">A carregar mais...</span>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
