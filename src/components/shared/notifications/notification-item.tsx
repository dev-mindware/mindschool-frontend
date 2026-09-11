"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { parseRawDate } from "@/utils";
import { NotificationType } from "@/types";
import { Icon, Button } from "@/components";
import { icons } from "lucide-react";

interface NotificationItemProps {
  notification: NotificationType;
  onClick: () => void;
  onDelete: () => void;
}

const NOTIFICATION_STYLES: Record<
  string,
  { icon: keyof typeof icons; colorClass: string; iconClass: string }
> = {
  AI_ALERT: {
    icon: "Sparkles",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  "MIND AI": {
    icon: "Sparkles",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  SUCCESS: {
    icon: "CircleCheck",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  SUCESSO: {
    icon: "CircleCheck",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  WARNING: {
    icon: "CircleAlert",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  "ATENÇÃO": {
    icon: "CircleAlert",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  ERROR: {
    icon: "OctagonAlert",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  ERRO: {
    icon: "OctagonAlert",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  INFO: {
    icon: "Info",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
  DEFAULT: {
    icon: "Bell",
    colorClass: "bg-primary/15",
    iconClass: "text-primary",
  },
};

export function NotificationItem({
  notification,
  onClick,
  onDelete,
}: NotificationItemProps) {
  let timeAgo = "";
  try {
    const date = notification.createdAt
      ? parseRawDate(notification.createdAt)
      : new Date();
    timeAgo = formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    timeAgo = "recentemente";
  }

  const isAiAlert =
    notification.isAiAlert ||
    notification.type === "AI_ALERT" ||
    String(notification.type || "").toUpperCase() === "AI_ALERT" ||
    notification.title.toUpperCase().includes("MIND AI") ||
    notification.title.toUpperCase().includes("ALERTA INTELIGENTE");

  const rawType = isAiAlert
    ? "AI_ALERT"
    : String(notification.type || "").toUpperCase();

  const style =
    NOTIFICATION_STYLES[rawType] ||
    NOTIFICATION_STYLES[notification.type] ||
    NOTIFICATION_STYLES.DEFAULT;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 transition-colors duration-150 relative cursor-pointer hover:bg-muted/40",
        !notification.isRead ? "bg-primary/5 dark:bg-primary/10" : "",
        isAiAlert && "border-l-2 border-l-primary/60"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative",
          style.colorClass
        )}
      >
        <Icon name={style.icon} className={cn("w-5 h-5", style.iconClass)} />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {isAiAlert && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/15 text-primary shrink-0">
                <Icon name="Sparkles" className="w-2.5 h-2.5" />
                MIND AI
              </span>
            )}
            <h4
              className={cn(
                "text-sm line-clamp-1",
                !notification.isRead
                  ? "font-semibold text-foreground"
                  : "font-medium text-muted-foreground"
              )}
            >
              {notification.title}
            </h4>
          </div>
          {!notification.isRead && (
            <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
          )}
        </div>

        <p
          className={cn(
            "text-sm line-clamp-2 mt-1",
            !notification.isRead ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {notification.message}
        </p>

        <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-destructive/15 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Icon name="Trash2" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

