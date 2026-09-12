"use client";

import Link from "next/link";
import { Card, CardContent, Icon, Badge } from "@/components";
import { DashboardQuickAction } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardQuickActionsProps {
  actions: DashboardQuickAction[];
  title?: string;
}

export function DashboardQuickActions({
  actions,
  title = "Ações Rápidas",
}: DashboardQuickActionsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground font-medium">
          Acesso direto às operações prioritárias
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const isTerracotta = action.variant === "terracotta";

          return (
            <Link key={action.id} href={action.href} className="group block">
              <Card
                className={cn(
                  "border transition-all duration-200 hover:shadow-md hover:border-primary/40 active:scale-[0.98] h-full",
                  isTerracotta
                    ? "bg-primary/5 border-primary/25 hover:bg-primary/10"
                    : "bg-card hover:bg-muted/40"
                )}
              >
                <CardContent className="p-4 flex items-start gap-3.5">
                  <div
                    className={cn(
                      "p-2.5 rounded-lg shrink-0 transition-colors",
                      isTerracotta
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted group-hover:bg-primary/10 text-foreground group-hover:text-primary"
                    )}
                  >
                    <Icon name={action.icon as any} className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {action.label}
                      </span>
                      {action.badge && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] px-1.5 py-0 shrink-0 font-semibold",
                            isTerracotta
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "bg-muted-foreground/10 text-muted-foreground"
                          )}
                        >
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {action.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
