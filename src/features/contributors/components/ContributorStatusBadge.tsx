"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type ContributorStatus = "A" | "C" | "D" | "E" | "F" | "G" | string;

interface ContributorStatusBadgeProps {
  status: ContributorStatus;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; glow: string }
> = {
  A: {
    label: "Ativo",
    bg: "bg-success-muted",
    text: "text-success",
    border: "border-success-border",
    glow: "shadow-[0_0_12px_-3px_var(--success)]",
  },
  C: {
    label: "Cessado",
    bg: "bg-muted/40",
    text: "text-muted-foreground",
    border: "border-border",
    glow: "",
  },
  D: {
    label: "Falecido",
    bg: "bg-muted/50",
    text: "text-muted-foreground",
    border: "border-border",
    glow: "",
  },
  E: {
    label: "Herança",
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
    glow: "shadow-[0_0_12px_-3px_var(--primary)]",
  },
  F: {
    label: "Anulado",
    bg: "bg-destructive-muted",
    text: "text-destructive",
    border: "border-destructive-border",
    glow: "shadow-[0_0_12px_-3px_var(--destructive)]",
  },
  G: {
    label: "Suspenso",
    bg: "bg-warning-muted",
    text: "text-warning",
    border: "border-warning-border",
    glow: "shadow-[0_0_12px_-3px_var(--warning)]",
  },
};

export function ContributorStatusBadge({ status, className }: ContributorStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status || "Desconhecido",
    bg: "bg-gray-50 dark:bg-gray-900/40",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-800",
    glow: "",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02]",
        config.bg,
        config.text,
        config.border,
        config.glow,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", status === "A" && "animate-pulse")} />
      {config.label}
    </span>
  );
}
