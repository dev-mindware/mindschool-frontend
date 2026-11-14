"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  ButtonOnlyAction,
  Can,
  ConfirmModal,
  DataList,
  EmptyState,
  GenericTable,
  Icon,
  TitleList,
  type Column,
  type ListFilterDef,
  type ListSortDef,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useCan } from "@/hooks/auth/use-can";
import { useAcademicYears, useYearTerms } from "@/hooks/school/use-academic";
import type { ApiAcademicTerm, ApiAcademicYear } from "@/services/academic-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatDateTime } from "@/utils";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatIsoDay } from "@/utils/format-date";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import {
  AcademicYearRegimeBadge,
  AcademicYearStatusBadge,
  SuspendedYearBanner,
  YEAR_REGIME_META,
  YEAR_STATUS_META,
} from "../year-status-banner";
import {
  CloseYearModal,
  RegimeModal,
  ReopenYearModal,
  ResumeYearModal,
  SuspendYearModal,
  TermFormModal,
  YearFormModal,
} from "./year-modals";
import { buildYearActions, YearHeaderActions } from "./year-actions";

const OWNER_LABEL: Record<ApiAcademicTerm["periodic_exam_owner"], string> = {
  professor: "Professor",
  subdireccao_pedagogica: "Subdirecção Pedagógica",
};

const YEAR_FILTERS: ListFilterDef<ApiAcademicYear>[] = [
  {
    key: "status",
    label: "Estado",
    icon: "CircleDot",
    options: Object.entries(YEAR_STATUS_META).map(([value, m]) => ({ value, label: m.label })),
    match: (y, v) => y.status === v,
  },
  {
    key: "regime",
    label: "Regime",
    icon: "SlidersHorizontal",
    options: Object.entries(YEAR_REGIME_META).map(([value, m]) => ({ value, label: m.label })),
    match: (y, v) => (y.delivery_mode ?? "presencial") === v,
  },
];

const YEAR_SORTS: ListSortDef<ApiAcademicYear>[] = [
  { value: "start_desc", label: "Mais recente", compare: (a, b) => b.start_date.localeCompare(a.start_date) },
  { value: "name", label: "Nome", compare: (a, b) => b.name.localeCompare(a.name) },
];

export function YearsPageContent() {
  const { years, currentYear, isLoading, isError, refetch, activateYear } = useAcademicYears();
  const { openModal } = useModal();
  const { can } = useCan();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedYear = useMemo(
    () => years.find((y) => y.id === selectedId) ?? currentYear ?? years[0] ?? null,
    [years, selectedId, currentYear],
  );

  const [formEditing, setFormEditing] = useState<ApiAcademicYear | null>(null);
  const [actionTarget, setActionTarget] = useState<ApiAcademicYear | null>(null);
  const [activateTarget, setActivateTarget] = useState<ApiAcademicYear | null>(null);
  const [termEditing, setTermEditing] = useState<ApiAcademicTerm | null>(null);

  const yearTerms = useYearTerms(selectedYear?.id);

  const nextTermSeq = useMemo(() => {
    const used = new Set(yearTerms.terms.map((t) => t.sequence));
    for (const n of [1, 2, 3]) {
      if (!used.has(n)) return n;
    }
    return 1;
  }, [yearTerms.terms]);

  const canWriteYear = can("academic_year:write");
  const canCloseYear = can("academic_year:close");
  const canWriteTerm = can("term:write");

  const yearActionCallbacks = {
    onSelectForTerms: (row: ApiAcademicYear) => setSelectedId(row.id),
    onEdit: (row: ApiAcademicYear) => {
      setFormEditing(row);
      openModal("academic-year-form");
    },
    onActivate: (row: ApiAcademicYear) => {
      setActivateTarget(row);
      openModal("academic-year-activate");
    },
    onTransition: (row: ApiAcademicYear, modalId: Parameters<typeof openModal>[0]) => {
      setActionTarget(row);
      openModal(modalId);
    },
  };

  const columns: Column<ApiAcademicYear>[] = [
    {
      key: "name",
      header: "Ano Lectivo",
      render: (_, y) => (
        <button
          type="button"
          onClick={() => setSelectedId(y.id)}
          className="flex items-center gap-2 text-left hover:underline"
        >
          <span className="font-semibold">{y.name}</span>
          {selectedYear?.id === y.id && (
            <Badge variant="outline" className="text-[10px]">
              Seleccionado
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: "dates",
      header: "Período do Ano",
      render: (_, y) => (
        <span className="font-mono text-xs whitespace-nowrap">
          {formatIsoDay(y.start_date)} → {formatIsoDay(y.end_date)}
        </span>
      ),
    },
    {
      key: "enrollments",
      header: "Matrículas",
      render: (_, y) =>
        y.enrollment_open_date && y.enrollment_close_date ? (
          <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
            {formatIsoDay(y.enrollment_open_date)} → {formatIsoDay(y.enrollment_close_date)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: "Estado",
      render: (_, y) => (
        <div className="flex flex-col gap-1">
          <AcademicYearStatusBadge status={y.status} />
          {y.status_reason && (
            <span className="max-w-52 truncate text-[11px] text-muted-foreground" title={y.status_reason}>
              {y.status_reason}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "delivery_mode",
      header: "Regime",
      render: (_, y) => <AcademicYearRegimeBadge regime={y.delivery_mode} />,
    },
    {
      key: "action",
      header: "Acções",
      render: (_, y) => (
        <ButtonOnlyAction
          data={y}
          actions={buildYearActions(y, { canWriteYear, canCloseYear }, yearActionCallbacks, true).map((a) => ({
            label: a.label,
            icon: a.icon,
            onClick: () => a.trigger(),
          }))}
        />
      ),
    },
  ];

  const termColumns: Column<ApiAcademicTerm>[] = [
    {
      key: "sequence",
      header: "#",
      render: (_, t) => <span className="font-mono font-semibold">{t.sequence}.º</span>,
    },
    {
      key: "name",
      header: "Período",
      render: (_, t) => <span className="font-medium">{t.name}</span>,
    },
    {
      key: "dates",
      header: "Datas",
      render: (_, t) => (
        <span className="font-mono text-xs whitespace-nowrap">
          {formatIsoDay(t.start_date)} → {formatIsoDay(t.end_date)}
        </span>
      ),
    },
    {
      key: "periodic_exam_owner",
      header: "Prova Periódica",
      render: (_, t) => (
        <span className="text-xs text-muted-foreground">
          {OWNER_LABEL[t.periodic_exam_owner] ?? t.periodic_exam_owner}
        </span>
      ),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, t) =>
        canWriteTerm && selectedYear && selectedYear.status !== "encerrado" ? (
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => {
              setTermEditing(t);
              openModal("academic-term-form");
            }}
          >
            <Icon name="Pencil" className="size-3.5" />
            Editar
          </Button>
        ) : null,
    },
  ];

  if (isError) {
    return (
      <EmptyState
        icon="TriangleAlert"
        title="Não foi possível carregar os anos lectivos"
        description="Verifique a ligação e tente novamente."
      >
        <Button size="sm" onClick={() => void refetch()}>
          Tentar novamente
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6">
      <TitleList
        title="Anos Lectivos e Regimes"
        suTitle="Gestão do ciclo lectivo, períodos escolares, alterações de regime e suspensões excepcionais."
      >
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/academic/calendar">
              <Icon name="CalendarDays" className="size-4" />
              Calendário Escolar
            </Link>
          </Button>
          <Can permission="academic_year:write">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setFormEditing(null);
                openModal("academic-year-form");
              }}
            >
              <Icon name="Plus" className="size-4" />
              Novo Ano Lectivo
            </Button>
          </Can>
        </div>
      </TitleList>

      <SuspendedYearBanner year={selectedYear} showRegimeNote linkToYears={false} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <DynamicMetricCard
          title={currentYear ? currentYear.name : "Sem ano"}
          subtitle="Ano corrente"
          icon="CalendarRange"
          description={currentYear ? YEAR_STATUS_META[currentYear.status].label : "Crie e active um ano"}
          colors={currentYear?.status === "suspenso" ? "destructive" : "default"}
        />
        <DynamicMetricCard
          title={currentYear ? YEAR_REGIME_META[currentYear.delivery_mode ?? "presencial"].label : "—"}
          subtitle="Regime de ensino"
          icon="MonitorCheck"
          description={currentYear?.status_reason ? "Com despacho registado" : "Modalidade operacional"}
        />
        <DynamicMetricCard
          title={yearTerms.terms.length}
          subtitle={selectedYear ? `Períodos (${selectedYear.name})` : "Períodos"}
          icon="ListChecks"
          description="Trimestres ou semestres"
        />
        <DynamicMetricCard
          title={years.length}
          subtitle="Total de anos"
          icon="Archive"
          description="Planeados, activos e encerrados"
        />
      </div>

      <DataList<ApiAcademicYear>
        prefix="academic-years"
        rows={years}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Pesquisar ano lectivo ou motivo..."
        searchText={(y) => `${y.name} ${y.status_reason ?? ""}`}
        filters={YEAR_FILTERS}
        sorts={YEAR_SORTS}
        emptyTitle="Ainda não existem anos lectivos"
        emptyDescription="Crie o primeiro ano lectivo para abrir matrículas, configurar períodos e gerar o calendário escolar."
        emptyIcon="CalendarRange"
      />

      {selectedYear && (
        <div className="space-y-4 rounded-xs border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Ano Lectivo {selectedYear.name}</h2>
                <AcademicYearStatusBadge status={selectedYear.status} />
                <AcademicYearRegimeBadge regime={selectedYear.delivery_mode} />
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                Datas: {formatIsoDay(selectedYear.start_date)} → {formatIsoDay(selectedYear.end_date)}
                {selectedYear.enrollment_open_date && selectedYear.enrollment_close_date
                  ? ` • Matrículas: ${formatIsoDay(selectedYear.enrollment_open_date)} → ${formatIsoDay(selectedYear.enrollment_close_date)}`
                  : ""}
              </p>
              {selectedYear.status_reason && (
                <p className="text-xs text-foreground/90">
                  <span className="font-medium">Última justificação:</span> {selectedYear.status_reason}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                {selectedYear.suspended_at && (
                  <span>Suspenso em {formatDateTime(selectedYear.suspended_at)}</span>
                )}
                {selectedYear.resumed_at && (
                  <span>Retomado em {formatDateTime(selectedYear.resumed_at)}</span>
                )}
                {selectedYear.closed_at && (
                  <span>Encerrado em {formatDateTime(selectedYear.closed_at)}</span>
                )}
              </div>
            </div>

            <YearHeaderActions
              year={selectedYear}
              permissions={{ canWriteYear, canCloseYear }}
              callbacks={yearActionCallbacks}
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">Períodos Lectivos ({selectedYear.name})</h3>
                <p className="text-xs text-muted-foreground">
                  As datas dos períodos definem os dias lectivos e os limites de lançamento de avaliações e pautas.
                </p>
              </div>
              {selectedYear.status !== "encerrado" && (
                <Can permission="term:write">
                  <div className="flex flex-wrap gap-2">
                    {yearTerms.terms.length === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={yearTerms.createDefaults.isPending}
                        onClick={() =>
                          yearTerms.createDefaults
                            .mutateAsync()
                            .then(() => SucessMessage("3 trimestres padrão criados."))
                            .catch((e) =>
                              ErrorMessage(getApiErrorMessage(e, "Não foi possível gerar os trimestres padrão.")),
                            )
                        }
                      >
                        Gerar 3 trimestres padrão
                      </Button>
                    )}
                    {yearTerms.terms.length < 3 && (
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          setTermEditing(null);
                          openModal("academic-term-form");
                        }}
                      >
                        <Icon name="Plus" className="size-4" />
                        Adicionar período
                      </Button>
                    )}
                  </div>
                </Can>
              )}
            </div>

            {yearTerms.terms.length === 0 && !yearTerms.isLoading ? (
              <p className="rounded-xs border border-dashed p-4 text-center text-xs text-muted-foreground">
                Este ano lectivo ainda não possui períodos configurados. Gere os 3 trimestres padrão ou crie manualmente.
              </p>
            ) : (
              <GenericTable
                data={yearTerms.terms}
                columns={termColumns}
                isLoading={yearTerms.isLoading}
                emptyMessage="Sem períodos configurados."
              />
            )}
          </div>
        </div>
      )}

      <YearFormModal editing={formEditing} />
      <RegimeModal target={actionTarget} />
      <SuspendYearModal target={actionTarget} />
      <ResumeYearModal target={actionTarget} />
      <CloseYearModal target={actionTarget} />
      <ReopenYearModal target={actionTarget} />
      <TermFormModal year={selectedYear} editing={termEditing} nextSequence={nextTermSeq} />

      <ConfirmModal
        id="academic-year-activate"
        title={activateTarget ? `Activar ano lectivo ${activateTarget.name}?` : "Activar ano lectivo?"}
        description="Torna este ano lectivo o ano corrente da escola para matrículas, turmas, aulas e calendário."
        confirmLabel="Activar ano"
        effects={[
          "Só pode existir um ano corrente (activo ou suspenso) por escola.",
          "Os dias lectivos e eventos passam a referenciar este ano.",
        ]}
        isLoading={activateYear.isPending}
        onConfirm={() => {
          if (!activateTarget) return;
          return activateYear
            .mutateAsync(activateTarget.id)
            .then(() => SucessMessage(`Ano lectivo ${activateTarget.name} activado.`))
            .catch((e) => {
              ErrorMessage(getApiErrorMessage(e, "Não foi possível activar o ano lectivo."));
              throw e;
            });
        }}
      />
    </div>
  );
}
