"use client";

import { Icon, Card, CardContent } from "@/components";
import { useNotifications } from "@/hooks";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseRawDate } from "@/utils";

interface SmartAlert {
  id: string | number;
  text: string;
  timestamp: string;
  unread: boolean;
  priority?: "high" | "medium" | "low";
}

const DEFAULT_SMART_ALERTS: SmartAlert[] = [
  {
    id: "smart-1",
    text: "Existem itens com projecção de ruptura nos próximos 5 a 7 dias de vendas",
    timestamp: "Há 15 minutos",
    unread: true,
    priority: "high",
  },
  {
    id: "smart-2",
    text: "Sugestão de reposição calculada com base na média diária de consumo",
    timestamp: "Há 45 minutos",
    unread: true,
    priority: "medium",
  },
  {
    id: "smart-3",
    text: "Fornecedores habituais com prazos de entrega mais longos identificados",
    timestamp: "Há 2 horas",
    unread: false,
    priority: "medium",
  },
  {
    id: "smart-4",
    text: "Artigos com maior rotatividade em caixa registaram aumento de 18% nesta semana",
    timestamp: "Há 6 horas",
    unread: false,
    priority: "low",
  },
];

export function AIAlerts() {
  const { notifications, markAsRead } = useNotifications();
  const [readAlertIds, setReadAlertIds] = useState<Set<string | number>>(new Set());

  const stockNotifications: SmartAlert[] = useMemo(() => {
    return notifications
      .filter((n) => {
        const rawType = String(n.type || "").toUpperCase();
        return (
          rawType === "WARNING" ||
          rawType === "ATENÇÃO" ||
          n.title.toLowerCase().includes("stock") ||
          n.message.toLowerCase().includes("stock") ||
          n.title.toLowerCase().includes("validade")
        );
      })
      .slice(0, 4)
      .map((n) => {
        let timeStr = "recentemente";
        try {
          timeStr = formatDistanceToNow(parseRawDate(n.createdAt), {
            addSuffix: true,
            locale: ptBR,
          });
        } catch {
          timeStr = "recentemente";
        }

        return {
          id: n.id,
          text: `${n.title}: ${n.message}`,
          timestamp: timeStr,
          unread: !n.isRead && !readAlertIds.has(n.id),
          priority: "high" as const,
        };
      });
  }, [notifications, readAlertIds]);

  const displayAlerts: SmartAlert[] = useMemo(() => {
    if (stockNotifications.length > 0) {
      return stockNotifications;
    }
    return DEFAULT_SMART_ALERTS.map((alert) => ({
      ...alert,
      unread: alert.unread && !readAlertIds.has(alert.id),
    }));
  }, [stockNotifications, readAlertIds]);

  const unreadCount = displayAlerts.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    const nextReadIds = new Set(readAlertIds);
    displayAlerts.forEach((a) => {
      nextReadIds.add(a.id);
      if (typeof a.id === "string" && !a.id.startsWith("smart-")) {
        void markAsRead(a.id);
      }
    });
    setReadAlertIds(nextReadIds);
  };

  const handleNotificationClick = (id: string | number) => {
    const nextReadIds = new Set(readAlertIds);
    nextReadIds.add(id);
    setReadAlertIds(nextReadIds);
    if (typeof id === "string" && !id.startsWith("smart-")) {
      void markAsRead(id);
    }
  };

  return (
    <Card className="h-full border-border/80 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Icon name="Sparkles" size={14} className="animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              Alertas Inteligentes MIND AI
            </span>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={handleMarkAllAsRead}
            >
              Marcar lidos
            </button>
          )}
        </div>

        <div className="h-px my-2 bg-border/60" />

        <div className="space-y-2 mt-2">
          {displayAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleNotificationClick(alert.id)}
              className={`p-3 text-sm transition-colors rounded-lg cursor-pointer flex items-start gap-2.5 border ${
                alert.unread
                  ? "bg-primary/5 hover:bg-primary/10 border-primary/20"
                  : "hover:bg-muted/60 opacity-85 border-transparent"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                  <Icon name="Sparkles" size={12} />
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">
                    MIND AI
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {alert.timestamp}
                  </span>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    alert.unread
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {alert.text}
                </p>
              </div>

              {alert.unread && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

