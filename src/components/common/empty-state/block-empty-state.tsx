"use client";

import Link from "next/link";
import { Icon } from "@/components/common/icon";
import { cn } from "@/lib/utils";
import type { icons } from "lucide-react";

export interface BlockEmptyStateProps {
  icon: keyof typeof icons;
  title: string;
  description?: string;
  tone?: "default" | "success" | "muted";
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/**
 * Estado vazio acolhedor para blocos, secções e cartões individuais do dashboard.
 * Mostra claramente que a secção está saudável/sem pendências ou convida à ação.
 */
export function BlockEmptyState({
  icon,
  title,
  description,
  tone = "default",
  actionLabel,
  actionHref,
  className,
}: BlockEmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-7 px-4 text-center", className)}>
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-xs mb-2.5 transition-colors border",
          tone === "success"
            ? "bg-success-muted border-success-border text-success"
            : "bg-muted/40 border-border/50 text-muted-foreground/70"
        )}
      >
        <Icon name={icon} className="size-5" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-[260px] text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          {actionLabel}
          <Icon name="ArrowRight" className="size-3" />
        </Link>
      )}
    </div>
  );
}

