"use client";

import { Button } from "@/components";
import type { ApiAcademicYear } from "@/services/academic-service";

type YearIconName =
  | "ListChecks"
  | "Pencil"
  | "CirclePlay"
  | "SlidersHorizontal"
  | "CirclePause"
  | "Play"
  | "Lock"
  | "LockOpen";

export type YearTransitionModalId =
  | "academic-year-regime"
  | "academic-year-suspend"
  | "academic-year-resume"
  | "academic-year-close"
  | "academic-year-reopen";

export interface YearActionSpec {
  key: string;
  label: string;
  headerLabel?: string;
  icon: YearIconName;
  variant?: "default" | "outline" | "destructive";
  trigger: () => void;
}

export interface YearActionCallbacks {
  onSelectForTerms?: (year: ApiAcademicYear) => void;
  onEdit: (year: ApiAcademicYear) => void;
  onActivate: (year: ApiAcademicYear) => void;
  onTransition: (year: ApiAcademicYear, modalId: YearTransitionModalId) => void;
}

export interface YearActionPermissions {
  canWriteYear: boolean;
  canCloseYear: boolean;
}

/** Matriz canónica das acções permitidas sobre um ano lectivo, partilhada entre a tabela e o detalhe. */
export function buildYearActions(
  year: ApiAcademicYear,
  permissions: YearActionPermissions,
  callbacks: YearActionCallbacks,
  includeInspect = false,
): YearActionSpec[] {
  const { canWriteYear, canCloseYear } = permissions;
  const items: YearActionSpec[] = [];

  if (includeInspect && callbacks.onSelectForTerms) {
    items.push({
      key: "terms",
      label: "Gerir períodos",
      icon: "ListChecks",
      trigger: () => callbacks.onSelectForTerms?.(year),
    });
  }
  if (canWriteYear && year.status !== "encerrado") {
    items.push({
      key: "edit",
      label: "Editar datas",
      icon: "Pencil",
      variant: "outline",
      trigger: () => callbacks.onEdit(year),
    });
  }
  if (canWriteYear && year.status === "planeado") {
    items.push({
      key: "activate",
      label: "Activar ano",
      icon: "CirclePlay",
      variant: "default",
      trigger: () => callbacks.onActivate(year),
    });
  }
  if (canWriteYear && year.status === "activo") {
    items.push({
      key: "regime",
      label: "Alterar regime",
      icon: "SlidersHorizontal",
      variant: "outline",
      trigger: () => callbacks.onTransition(year, "academic-year-regime"),
    });
  }
  if (canCloseYear && year.status === "activo") {
    items.push({
      key: "suspend",
      label: "Suspender ano",
      headerLabel: "Suspender",
      icon: "CirclePause",
      variant: "outline",
      trigger: () => callbacks.onTransition(year, "academic-year-suspend"),
    });
  }
  if (canCloseYear && year.status === "suspenso") {
    items.push({
      key: "resume",
      label: "Retomar ano",
      headerLabel: "Retomar aulas",
      icon: "Play",
      variant: "default",
      trigger: () => callbacks.onTransition(year, "academic-year-resume"),
    });
  }
  if (canCloseYear && (year.status === "activo" || year.status === "suspenso")) {
    items.push({
      key: "close",
      label: "Encerrar ano",
      icon: "Lock",
      variant: "destructive",
      trigger: () => callbacks.onTransition(year, "academic-year-close"),
    });
  }
  if (canCloseYear && year.status === "encerrado") {
    items.push({
      key: "reopen",
      label: "Reabrir ano",
      icon: "LockOpen",
      variant: "outline",
      trigger: () => callbacks.onTransition(year, "academic-year-reopen"),
    });
  }

  return items;
}

export function YearHeaderActions({
  year,
  permissions,
  callbacks,
}: {
  year: ApiAcademicYear;
  permissions: YearActionPermissions;
  callbacks: YearActionCallbacks;
}) {
  const actions = buildYearActions(year, permissions, callbacks, false);
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button key={action.key} size="sm" variant={action.variant ?? "default"} onClick={action.trigger}>
          {action.headerLabel ?? action.label}
        </Button>
      ))}
    </div>
  );
}

