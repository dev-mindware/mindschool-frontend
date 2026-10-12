"use client";

import Link from "next/link";
import { Icon } from "@/components";
import { cn } from "@/lib/utils";
import type { icons } from "lucide-react";

interface BlockEmptyStateProps {
  icon: keyof typeof icons;
  title: string;
  description?: string;
  tone?: "default" | "success" | "muted";
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/**
 * Estado vazio elegante e acolhedor para blocos e secções do dashboard.
 * Mostra claramente que a secção está saudável/sem pendências ou convida à acção.
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
          "flex size-11 items-center justify-center rounded-xl mb-2.5 transition-colors border",
          tone === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
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
