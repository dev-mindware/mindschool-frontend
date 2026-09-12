"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Icon } from "@/components";
import { SecretaryQueueItem } from "@/types";
import { cn } from "@/lib/utils";

interface SecretaryQueueWidgetProps {
  queue?: SecretaryQueueItem[];
}

export function SecretaryQueueWidget({ queue = [] }: SecretaryQueueWidgetProps) {
  if (!queue || queue.length === 0) return null;

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Icon name="Inbox" className="w-5 h-5 text-primary" />
            Fila de Atendimento e Pedidos de Documentos
          </CardTitle>
          <Link href="/certificates/declarations">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary/90">
              Ver Balcão <Icon name="ArrowRight" className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {queue.map((item) => {
          const isUrgent = item.urgency === "URGENT";
          const isHigh = item.urgency === "HIGH";

          return (
            <div
              key={item.id}
              className="p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate text-sm">
                    {item.title}
                  </span>
                  {isUrgent ? (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-medium uppercase">
                      Urgente
                    </Badge>
                  ) : isHigh ? (
                    <Badge className="text-[10px] px-1.5 py-0 font-medium bg-amber-100 text-amber-800 uppercase">
                      Prioridade
                    </Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 text-muted-foreground text-[11px]">
                  <span>Requerente: <strong className="text-foreground">{item.requesterName}</strong></span>
                  <span>•</span>
                  <span>{item.requestedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    item.status === "READY"
                      ? "text-emerald-700 border-emerald-300 bg-emerald-50"
                      : item.status === "PROCESSING"
                      ? "text-blue-700 border-blue-300 bg-blue-50"
                      : "text-amber-700 border-amber-300 bg-amber-50"
                  )}
                >
                  {item.status === "READY"
                    ? "Pronto"
                    : item.status === "PROCESSING"
                    ? "Em Processamento"
                    : "Pendente"}
                </Badge>
                <Link href="/certificates/declarations">
                  <Button size="sm" variant="outline" className="h-8 text-xs font-medium">
                    Emitir
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
