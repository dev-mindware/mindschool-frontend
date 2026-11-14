"use client";

import Link from "next/link";
import { Badge, Button, Icon } from "@/components";
import { useAcademicYears } from "@/hooks/school/use-academic";
import type { AcademicYearRegime, AcademicYearStatus, ApiAcademicYear } from "@/services/academic-service";
import { formatIsoDay } from "@/utils/format-date";

export const YEAR_STATUS_META: Record<
  AcademicYearStatus,
  { label: string; variant: "outline" | "success" | "warning" | "secondary" }
> = {
  planeado: { label: "Planeado", variant: "outline" },
  activo: { label: "Activo", variant: "success" },
  suspenso: { label: "Suspenso", variant: "warning" },
  encerrado: { label: "Encerrado", variant: "secondary" },
};

export const YEAR_REGIME_META: Record<
  AcademicYearRegime,
  { label: string; variant: "default" | "info" | "special" | "warning" }
> = {
  presencial: { label: "Presencial", variant: "default" },
  hibrido: { label: "Híbrido", variant: "info" },
  remoto: { label: "Remoto", variant: "special" },
  pausa: { label: "Em pausa", variant: "warning" },
};

export function AcademicYearStatusBadge({ status }: { status: AcademicYearStatus }) {
  const meta = YEAR_STATUS_META[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

export function AcademicYearRegimeBadge({ regime }: { regime?: AcademicYearRegime | null }) {
  const key = regime ?? "presencial";
  const meta = YEAR_REGIME_META[key] ?? { label: key, variant: "outline" as const };
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

interface SuspendedYearBannerProps {
  /** Se omitido, consulta automaticamente o ano lectivo corrente da escola. */
  year?: ApiAcademicYear | null;
  /** Descrição específica do impacto na página actual (aulas, presenças, notas, calendário). */
  contextMessage?: string;
  /** Mostra também um aviso informativo quando o ano está activo em regime híbrido ou remoto. */
  showRegimeNote?: boolean;
  /** Mostra atalho para `/academic/years` para gerir o estado/regime. */
  linkToYears?: boolean;
}

/**
 * Faixa contextual de estado excepcional do Ano Lectivo:
 * - Alerta âmbar quando `status === "suspenso"` (calamidade, greve, obra ou força maior);
 * - Nota informativa quando `status === "activo"` em regime `hibrido` ou `remoto`.
 */
export function SuspendedYearBanner({
  year: propYear,
  contextMessage,
  showRegimeNote = false,
  linkToYears = true,
}: SuspendedYearBannerProps) {
  const { currentYear } = useAcademicYears();
  const year = propYear !== undefined ? propYear : currentYear;

  if (!year) return null;

  if (year.status === "suspenso") {
    const since = year.suspended_at ? formatIsoDay(year.suspended_at.slice(0, 10)) : null;
    return (
      <div
        role="alert"
        className="flex flex-wrap items-start gap-3 rounded-xs border border-amber-500/40 bg-amber-500/10 p-3.5 text-sm"
      >
        <Icon name="TriangleAlert" className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="font-semibold">
              Ano lectivo {year.name} suspenso{since ? ` desde ${since}` : ""}
            </strong>
            <AcademicYearRegimeBadge regime={year.delivery_mode} />
          </div>
          {year.status_reason && (
            <p className="text-xs text-foreground/90">
              <span className="font-medium">Motivo:</span> {year.status_reason}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {contextMessage ??
              "As actividades lectivas presenciais e os registos operacionais estão temporariamente bloqueados. Matrículas, finanças e gestão de calendário mantêm-se disponíveis."}
          </p>
        </div>
        {linkToYears && (
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/academic/years">Gerir Ano Lectivo</Link>
          </Button>
        )}
      </div>
    );
  }

  if (
    showRegimeNote &&
    year.status === "activo" &&
    (year.delivery_mode === "hibrido" || year.delivery_mode === "remoto")
  ) {
    return (
      <div
        role="status"
        className="flex flex-wrap items-center gap-3 rounded-xs border border-info-border bg-info-muted/60 p-3 text-sm"
      >
        <Icon name="Info" className="size-4 shrink-0 text-info" />
        <div className="min-w-0 flex-1 text-xs">
          <span className="font-semibold">
            Ano lectivo {year.name} em regime {YEAR_REGIME_META[year.delivery_mode].label}.
          </span>{" "}
          {year.status_reason && <span className="text-muted-foreground">Motivo: {year.status_reason}</span>}
        </div>
        {linkToYears && (
          <Button asChild size="sm" variant="outline" className="shrink-0">
            <Link href="/academic/years">Alterar regime</Link>
          </Button>
        )}
      </div>
    );
  }

  return null;
}

