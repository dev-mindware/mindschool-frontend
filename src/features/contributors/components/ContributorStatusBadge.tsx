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
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800/50",
    glow: "shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]",
  },
  C: {
    label: "Cessado",
    bg: "bg-slate-50 dark:bg-slate-900/40",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
    glow: "",
  },
  D: {
    label: "Falecido",
    bg: "bg-zinc-100 dark:bg-zinc-900",
    text: "text-zinc-700 dark:text-zinc-400",
    border: "border-zinc-300 dark:border-zinc-800",
    glow: "",
  },
  E: {
    label: "Herança",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800/40",
    glow: "shadow-[0_0_12px_-3px_rgba(168,85,247,0.2)]",
  },
  F: {
    label: "Anulado",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800/50",
    glow: "shadow-[0_0_12px_-3px_rgba(244,63,94,0.3)]",
  },
  G: {
    label: "Suspenso",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800/50",
    glow: "shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]",
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
