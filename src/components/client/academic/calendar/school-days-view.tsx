"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { isoDateSchema, isValidIsoDate, safeTextSchema } from "@/schemas/helps";
import {
  Badge,
  Button,
  Can,
  ConfirmModal,
  FormModal,
  FormTextarea,
  GenericTable,
  Icon,
  Input,
  MonthCalendar,
  TitleList,
  type CalendarItem,
  type Column,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useSchoolDays } from "@/hooks/school/use-school-days";
import type { ApiSchoolDay } from "@/services/calendar-service";
import { usePlanUpgradeModal } from "@/stores/plan/use-plan-upgrade-modal-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

type Kind = "lectivo" | "fim_de_semana" | "pausa" | "marca" | "feriado";

const WEEKEND_REASONS = ["Fim de semana", "Dia da semana nao letivo"];

const kindOf = (d: ApiSchoolDay): Kind => {
  if (d.lectivo) return "lectivo";
  if (WEEKEND_REASONS.includes(d.reason)) return "fim_de_semana";
  if (d.reason === "Fora dos periodos letivos") return "pausa";
  return d.source === "calendario" ? "marca" : "feriado";
};

const KIND_LABEL: Record<"marca" | "feriado", string> = { marca: "Marca da Direção", feriado: "Feriado" };
const fail = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));

type HighlightRow = {
  id: string;
  d: ApiSchoolDay;
  kind: "marca" | "feriado";
};

const markDaySchema = z
  .object({
    start: isoDateSchema("A data de início"),
    end: z
      .string()
      .trim()
      .refine((v) => v === "" || isValidIsoDate(v), "A data de fim é inválida (AAAA-MM-DD).")
      .optional(),
    title: safeTextSchema(3, 150, "O título"),
    justification: safeTextSchema(5, 500, "O motivo"),
  })
  .superRefine((data, ctx) => {
    if (data.end && data.end < data.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end"],
        message: "A data de fim deve ser igual ou posterior à data de início.",
      });
    }
  });

const INITIAL_MARK_DAY = { start: "", end: "", title: "", justification: "" };

function MarkDayModal() {
  const { open } = useModal();
  const { mark } = useSchoolDays(new Date());
  const [f, setF] = useState(INITIAL_MARK_DAY);
  const [touched, setTouched] = useState<Partial<Record<keyof typeof INITIAL_MARK_DAY, boolean>>>({});
  const set = <K extends keyof typeof f>(k: K, v: string) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    setF((p) => ({ ...p, [k]: v }));
  };

  const parsed = useMemo(() => markDaySchema.safeParse(f), [f]);
  const fieldError = (key: keyof typeof INITIAL_MARK_DAY, alsoShowIf?: boolean) => {
    if ((!touched[key] && !alsoShowIf) || parsed.success) return undefined;
    return parsed.error.issues.find((i) => i.path[0] === key)?.message;
  };

  if (!open["school-days-mark"]) return null;
  const resetForm = () => {
    setF(INITIAL_MARK_DAY);
    setTouched({});
  };
  const submit = () => {
    if (!parsed.success) return;
    const d = parsed.data;
    return mark
      .mutateAsync({ startDate: d.start, endDate: d.end || undefined, title: d.title, justification: d.justification })
      .then(() => { SucessMessage("Dia(s) marcado(s) como não letivo(s)."); resetForm(); })
      .catch((e) => { fail(e); throw e; });
  };
  return (
    <FormModal id="school-days-mark" title="Marcar dia não letivo" description="Use para decretos, calamidades ou encerramentos. Estes dias deixam de ser letivos: o contador de dias letivos desce e a assiduidade já não é exigida (as faltas já lançadas não se apagam). Só se marcam dias dentro do ano letivo; a marca remove-se depois, com «Remover marca»." submitLabel="Marcar" isLoading={mark.isPending} onSubmit={submit} onClose={resetForm} disabled={!parsed.success || mark.isPending}>
      <Input label="Início *" type="date" value={f.start} onChange={(e) => set("start", e.target.value)} error={fieldError("start")} />
      <Input label="Fim (opcional)" type="date" value={f.end} onChange={(e) => set("end", e.target.value)} error={fieldError("end", Boolean(touched.start && f.end))} />
      <div className="sm:col-span-2">
        <Input label="Título *" startIcon="CalendarX" placeholder="Ex.: Tolerância de Ponto / Luto Nacional" value={f.title} onChange={(e) => set("title", e.target.value)} error={fieldError("title")} />
      </div>
      <div className="sm:col-span-2">
        <FormTextarea
          label="Motivo * (mín. 5 caracteres)"
          placeholder="Ex.: Decreto executivo n.º 12/26, calamidade pública ou despacho governamental..."
          value={f.justification}
          onChange={(v) => set("justification", v)}
          error={fieldError("justification")}
          rows={3}
        />
      </div>
    </FormModal>
  );
}

/**
 * Calendário do Essencial: dias letivos, feriados e marcas da Direção do ano letivo, só de leitura (a Direção pode
 * marcar dias não letivos). Os eventos, as atividades e o Google Calendar fazem parte do plano Profissional.
 */
export function SchoolDaysView() {
  const [month, setMonth] = useState(() => new Date());
  const s = useSchoolDays(month);
  const { openModal } = useModal();
  const planModal = usePlanUpgradeModal();
  const [toRemove, setToRemove] = useState<ApiSchoolDay | null>(null);

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const kinds = useMemo(() => s.days.map((d) => ({ d, kind: kindOf(d) })), [s.days]);
  const inMonth = kinds.filter(({ d }) => d.date.startsWith(monthKey));

  const items: CalendarItem[] = kinds
    .filter(({ kind }) => kind === "feriado" || kind === "marca")
    .map(({ d, kind }) => ({ id: d.date, title: d.reason, start: d.date, tone: kind === "marca" ? "danger" : "warning" }));
  const nonLective = useMemo(() => new Set(kinds.filter(({ kind }) => kind !== "lectivo" && kind !== "fim_de_semana").map(({ d }) => d.date)), [kinds]);
  const highlights: HighlightRow[] = inMonth
    .filter((x): x is { d: ApiSchoolDay; kind: "marca" | "feriado" } => x.kind === "feriado" || x.kind === "marca")
    .map(({ d, kind }) => ({ id: d.date, d, kind }));
  const count = (k: Kind) => inMonth.filter((x) => x.kind === k).length;

  const highlightColumns: Column<HighlightRow>[] = [
    {
      key: "id",
      header: "Data",
      render: (_, row) => <span className="font-mono text-xs text-muted-foreground">{row.d.date}</span>,
    },
    {
      key: "reason",
      header: "Descrição",
      render: (_, row) => <span className="font-medium">{row.d.reason}</span>,
    },
    {
      key: "kind",
      header: "Tipo",
      render: (_, row) => <Badge variant="outline">{KIND_LABEL[row.kind]}</Badge>,
    },
    {
      key: "action",
      header: "Ação",
      className: "text-right",
      render: (_, row) =>
        row.kind === "marca" && row.d.event_id ? (
          <Can permission="calendar:mark_day">
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                setToRemove(row.d);
                openModal("school-days-unmark");
              }}
            >
              Remover marca
            </Button>
          </Can>
        ) : null,
    },
  ];

  const upgrade = () =>
    planModal.open({
      requiredPlan: "profissional",
      featureName: "Calendário geral da escola",
      description: "O calendário geral — atividades, avaliações, reuniões, revisões com impacto e Google Calendar — faz parte do plano Profissional.",
    });

  return (
    <div className="space-y-6">
      <TitleList title="Calendário Escolar" suTitle="Configuração de dias letivos, turnos e tempos por dia.">
        <Can permission="calendar:mark_day">
          <Button size="sm" className="gap-1.5" disabled={!s.year} onClick={() => openModal("school-days-mark")}><Icon name="CalendarX" className="size-4" />Marcar dia não letivo</Button>
        </Can>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
        <DynamicMetricCard title={count("lectivo")} subtitle="Dias letivos no mês" icon="CalendarCheck" description="Dias de aulas para os alunos" />
        <DynamicMetricCard title={count("feriado")} subtitle="Feriados no mês" icon="PartyPopper" description="Calculados pela regra nacional" />
        <DynamicMetricCard title={count("marca")} subtitle="Marcas da Direção" icon="CalendarX" description="Dias não letivos decretados" colors={count("marca") > 0 ? "destructive" : "default"} />
      </div>

      <MonthCalendar items={items} month={month} onMonthChange={setMonth} markedDays={nonLective} />
      <p className="text-xs text-muted-foreground">Dias com fundo âmbar são não letivos (feriados, pausas e marcas da Direção). Fins de semana não se destacam.</p>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Feriados e marcas deste mês</h3>
        <GenericTable
          data={highlights}
          columns={highlightColumns}
          emptyMessage={s.isLoading ? "A carregar…" : "Sem feriados nem marcas neste mês."}
        />
      </section>

      <div className="flex flex-col gap-3 rounded-xs border border-dashed bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon name="Lock" className="mt-0.5 size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Quer planear atividades, avaliações e reuniões no calendário?</p>
            <p className="text-xs text-muted-foreground">O calendário geral, as revisões com impacto e a ligação ao Google Calendar estão no plano Profissional.</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={upgrade}>Ver o plano Profissional</Button>
      </div>

      <MarkDayModal />
      <ConfirmModal
        id="school-days-unmark" destructive title="Remover marca de dia não letivo" description={toRemove ? `Os dias de «${toRemove.reason}» voltam a contar como letivos.` : ""}
        confirmLabel="Remover" isLoading={s.unmark.isPending}
        onConfirm={() => (toRemove?.event_id ? s.unmark.mutateAsync(toRemove.event_id).then(() => SucessMessage("Marca removida.")).catch((e) => { fail(e); throw e; }) : Promise.resolve())}
      />
    </div>
  );
}
