"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Button, Card, CardContent, CardHeader, CardTitle, Checkbox, EmptyState, FormModal, FormSelect, Icon, Input, TitleList } from "@/components";
import { deepMerge, patchSettings, readRawSettings } from "@/services/school-settings-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { icons } from "lucide-react";

/** Valores por omissao (os mesmos da API: `resolveSettings`); o que a escola grava sobrepoe-se. */
const DEFAULTS = {
  evaluation: {
    mt_weights: { mac: 1, mas: 1, pp: 1 }, mt_rounding: "integer", absent_policy: "zero", pass_mark: 10, review_window_days: 10, council_min_attendees: 3,
    final_exam: { admission_min_mfd: 7, weight_mfd: 50, recurso_enabled: true, melhoria_enabled: true },
  },
  admission: { entrance_exam_required_level_numbers: [] as number[], min_pass_score: 10, waitlist_tiebreak: "submission_order" },
  calendar: { lective_weekdays: [1, 2, 3, 4, 5], summary_deadline_days: 1, enforce_lective_attendance: false },
  risk: { weights: { frequencia: 1, desempenho: 1, financeiro: 1 }, thresholds: { moderado: 35, elevado: 65 }, overdue_days: 30 },
  finance: { installments: 10, due_day: 5, reminder_days: [3, 1] as number[] },
} as const;

type Settings = {
  evaluation: { mt_weights: { mac: number; mas: number; pp: number }; mt_rounding: string; absent_policy: string; pass_mark: number; review_window_days: number; council_min_attendees: number; final_exam: { admission_min_mfd: number; weight_mfd: number; recurso_enabled: boolean; melhoria_enabled: boolean } };
  admission: { entrance_exam_required_level_numbers: number[]; min_pass_score: number | null; waitlist_tiebreak: string };
  calendar: { lective_weekdays: number[]; summary_deadline_days: number; enforce_lective_attendance: boolean };
  risk: { weights: { frequencia: number; desempenho: number; financeiro: number }; thresholds: { moderado: number; elevado: number }; overdue_days: number };
  finance: { installments: number; due_day: number; reminder_days: number[] };
};
type Block = keyof Settings;

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const num = (v: string) => (v === "" ? 0 : Number(v));
const list = (v: string) => v.split(",").map((x) => Number(x.trim())).filter((x) => Number.isInteger(x) && x > 0);

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex items-center gap-2 text-sm sm:col-span-2"><Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />{label}</label>;
}

function PolicyCard({ icon, title, hint, rows, onEdit }: { icon: keyof typeof icons; title: string; hint: string; rows: Array<[string, ReactNode]>; onEdit: () => void }) {
  return (
    <Card className="h-full gap-0 py-4">
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-4 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon name={icon} className="size-4" /></span>
            {title}
          </CardTitle>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Can permission="school:update"><Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={onEdit}><Icon name="Pencil" className="size-3.5" />Editar</Button></Can>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {rows.map(([k, v]) => (<div key={k} className="flex flex-col"><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Políticas da escola: avaliação, exames finais, prova de acesso, calendário, risco de abandono e propinas. Cada bloco edita-se num modal. */
export function PoliciesPageContent() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const { open, openModal } = useModal();
  const raw = useQuery({ queryKey: ["settings-raw", schoolId], queryFn: readRawSettings, enabled: Boolean(schoolId), staleTime: 30 * 1000 });
  const [s, setS] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (raw.data) setS(deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), raw.data) as unknown as Settings);
  }, [raw.data]);

  const edit = (id: string) => { setDraft(JSON.parse(JSON.stringify(s)) as Settings); openModal(id); };
  const save = (blocks: Block[]) => async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await patchSettings(Object.fromEntries(blocks.map((b) => [b, draft[b]])) as Record<string, unknown>);
      SucessMessage("Definições guardadas.");
      await qc.invalidateQueries({ queryKey: ["settings-raw", schoolId] });
      void qc.invalidateQueries({ queryKey: ["school", schoolId] });
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar."));
      throw e;
    } finally {
      setSaving(false);
    }
  };

  if (raw.isLoading || !s) return <div className="text-sm text-muted-foreground">A carregar…</div>;
  if (raw.isError) return <EmptyState icon="Lock" title="Sem acesso" description="Não foi possível carregar as políticas da escola." />;

  const d = draft ?? s;
  const ev = d.evaluation;
  const setEv = (patch: Partial<Settings["evaluation"]>) => setDraft({ ...d, evaluation: { ...ev, ...patch } });
  const yn = (v: boolean) => (v ? "Sim" : "Não");
  const modalProps = { isLoading: saving, size: "lg" as const };
  const isOpen = (id: string) => Boolean(open[id]);

  return (
    <div className="space-y-6">
      <TitleList title="Políticas da Escola" suTitle="Parâmetros de avaliação, exames, admissão, calendário, risco de abandono e pagamento. Os valores iniciais são de referência: valide-os com a Direcção." />

      <div className="grid gap-4 lg:grid-cols-2">
        <PolicyCard icon="ClipboardCheck" title="Avaliação" hint="Média trimestral (MT), faltas a avaliações e reapreciação." onEdit={() => edit("policy-evaluation")} rows={[
          ["Pesos MAC / MAS / PP", `${s.evaluation.mt_weights.mac} / ${s.evaluation.mt_weights.mas} / ${s.evaluation.mt_weights.pp}`], ["Arredondamento", s.evaluation.mt_rounding === "integer" ? "Inteiro" : "2 casas"],
          ["Falta a avaliação", s.evaluation.absent_policy === "zero" ? "Conta como 0" : "Não entra na média"], ["Nota mínima", s.evaluation.pass_mark],
          ["Prazo de reapreciação", `${s.evaluation.review_window_days} dias`], ["Quórum do conselho", s.evaluation.council_min_attendees],
        ]} />
        <PolicyCard icon="GraduationCap" title="Exames finais" hint="Valores de referência: a documentação oficial não os fixa." onEdit={() => edit("policy-final-exam")} rows={[
          ["MFD mínima de admissão", s.evaluation.final_exam.admission_min_mfd], ["Peso da MFD", `${s.evaluation.final_exam.weight_mfd}%`],
          ["Recurso", yn(s.evaluation.final_exam.recurso_enabled)], ["Melhoria", yn(s.evaluation.final_exam.melhoria_enabled)],
        ]} />
        <PolicyCard icon="UserPlus" title="Admissões" hint="Provas de acesso e desempate da lista de espera." onEdit={() => edit("policy-admission")} rows={[
          ["Classes com prova", s.admission.entrance_exam_required_level_numbers.join(", ") || "Nenhuma"], ["Nota mínima", s.admission.min_pass_score ?? "—"],
          ["Desempate", s.admission.waitlist_tiebreak === "age" ? "Idade" : "Ordem de submissão"],
        ]} />
        <PolicyCard icon="CalendarDays" title="Calendário" hint="Dias lectivos e prazo dos sumários." onEdit={() => edit("policy-calendar")} rows={[
          ["Dias lectivos", s.calendar.lective_weekdays.map((n) => WEEKDAYS[n - 1]).join(", ")], ["Prazo do sumário", `${s.calendar.summary_deadline_days} dia(s)`],
          ["Recusar assiduidade em dias não lectivos", yn(s.calendar.enforce_lective_attendance)],
        ]} />
        <PolicyCard icon="TriangleAlert" title="Risco de abandono" hint="Pesos e limiares (0–100) dos níveis moderado e elevado." onEdit={() => edit("policy-risk")} rows={[
          ["Pesos (freq. / desemp. / fin.)", `${s.risk.weights.frequencia} / ${s.risk.weights.desempenho} / ${s.risk.weights.financeiro}`], ["Limiares (mod. / elev.)", `${s.risk.thresholds.moderado} / ${s.risk.thresholds.elevado}`],
          ["Atraso financeiro relevante", `${s.risk.overdue_days} dias`],
        ]} />
        <PolicyCard icon="Wallet" title="Pagamento das propinas" hint="Os valores (propina, matrícula, mora) editam-se em Propinas → Tabela de preços." onEdit={() => edit("policy-finance")} rows={[
          ["Prestações", s.finance.installments], ["Dia de vencimento", s.finance.due_day], ["Lembretes (dias antes)", s.finance.reminder_days.join(", ") || "—"],
        ]} />
      </div>

      {isOpen("policy-evaluation") && (
        <FormModal id="policy-evaluation" title="Política de avaliação" description="Como se calcula a média trimestral (MT) e como se tratam faltas a avaliações." onSubmit={save(["evaluation"])} {...modalProps}>
          <Input label="Peso MAC" type="number" value={ev.mt_weights.mac} onChange={(e) => setEv({ mt_weights: { ...ev.mt_weights, mac: num(e.target.value) } })} />
          <Input label="Peso MAS" type="number" value={ev.mt_weights.mas} onChange={(e) => setEv({ mt_weights: { ...ev.mt_weights, mas: num(e.target.value) } })} />
          <Input label="Peso da prova periódica" type="number" value={ev.mt_weights.pp} onChange={(e) => setEv({ mt_weights: { ...ev.mt_weights, pp: num(e.target.value) } })} />
          <FormSelect label="Arredondamento da MT" value={ev.mt_rounding} onValueChange={(v) => setEv({ mt_rounding: v })} options={[{ value: "integer", label: "Inteiro" }, { value: "two_decimals", label: "Duas casas decimais" }]} />
          <FormSelect label="Falta a uma avaliação" value={ev.absent_policy} onValueChange={(v) => setEv({ absent_policy: v })} options={[{ value: "zero", label: "Conta como 0" }, { value: "excluded", label: "Não entra na média" }]} />
          <Input label="Nota mínima de aprovação" type="number" value={ev.pass_mark} onChange={(e) => setEv({ pass_mark: num(e.target.value) })} />
          <Input label="Prazo de reapreciação (dias)" type="number" value={ev.review_window_days} onChange={(e) => setEv({ review_window_days: num(e.target.value) })} />
          <Input label="Quórum do conselho de turma" type="number" value={ev.council_min_attendees} onChange={(e) => setEv({ council_min_attendees: num(e.target.value) })} />
        </FormModal>
      )}

      {isOpen("policy-final-exam") && (
        <FormModal id="policy-final-exam" title="Exames finais" description="Valores de referência: valide-os com a Direcção." onSubmit={save(["evaluation"])} {...modalProps}>
          <Input label="MFD mínima para admissão" type="number" value={ev.final_exam.admission_min_mfd} onChange={(e) => setEv({ final_exam: { ...ev.final_exam, admission_min_mfd: num(e.target.value) } })} />
          <Input label="Peso da MFD na classificação (%)" type="number" value={ev.final_exam.weight_mfd} onChange={(e) => setEv({ final_exam: { ...ev.final_exam, weight_mfd: num(e.target.value) } })} />
          <Check label="Exame de recurso activo" checked={ev.final_exam.recurso_enabled} onChange={(v) => setEv({ final_exam: { ...ev.final_exam, recurso_enabled: v } })} />
          <Check label="Exame de melhoria activo" checked={ev.final_exam.melhoria_enabled} onChange={(v) => setEv({ final_exam: { ...ev.final_exam, melhoria_enabled: v } })} />
        </FormModal>
      )}

      {isOpen("policy-admission") && (
        <FormModal id="policy-admission" title="Admissões" description="Classes que exigem prova de acesso e critério de desempate da lista de espera." onSubmit={save(["admission"])} {...modalProps}>
          <Input label="Classes com prova de acesso (separadas por vírgula)" placeholder="Ex: 7, 10" value={d.admission.entrance_exam_required_level_numbers.join(", ")} onChange={(e) => setDraft({ ...d, admission: { ...d.admission, entrance_exam_required_level_numbers: list(e.target.value) } })} />
          <Input label="Nota mínima da prova" type="number" value={d.admission.min_pass_score ?? ""} onChange={(e) => setDraft({ ...d, admission: { ...d.admission, min_pass_score: e.target.value === "" ? null : Number(e.target.value) } })} />
          <FormSelect label="Desempate da lista de espera" value={d.admission.waitlist_tiebreak} onValueChange={(v) => setDraft({ ...d, admission: { ...d.admission, waitlist_tiebreak: v } })} options={[{ value: "submission_order", label: "Ordem de submissão" }, { value: "age", label: "Idade" }]} />
        </FormModal>
      )}

      {isOpen("policy-calendar") && (
        <FormModal id="policy-calendar" title="Calendário" onSubmit={save(["calendar"])} {...modalProps}>
          <div className="sm:col-span-2 space-y-1.5">
            <span className="text-sm font-medium">Dias lectivos</span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((w, i) => {
                const n = i + 1;
                const on = d.calendar.lective_weekdays.includes(n);
                return <Button key={w} type="button" size="sm" variant={on ? "default" : "outline"} onClick={() => setDraft({ ...d, calendar: { ...d.calendar, lective_weekdays: on ? d.calendar.lective_weekdays.filter((x) => x !== n) : [...d.calendar.lective_weekdays, n].sort() } })}>{w}</Button>;
              })}
            </div>
          </div>
          <Input label="Prazo do sumário (dias)" type="number" value={d.calendar.summary_deadline_days} onChange={(e) => setDraft({ ...d, calendar: { ...d.calendar, summary_deadline_days: num(e.target.value) } })} />
          <Check label="Recusar assiduidade em dias não lectivos (por omissão só avisa)" checked={d.calendar.enforce_lective_attendance} onChange={(v) => setDraft({ ...d, calendar: { ...d.calendar, enforce_lective_attendance: v } })} />
        </FormModal>
      )}

      {isOpen("policy-risk") && (
        <FormModal id="policy-risk" title="Risco de abandono" description="Pesos das componentes e limiares (0–100) para os níveis moderado e elevado." onSubmit={save(["risk"])} {...modalProps}>
          {(["frequencia", "desempenho", "financeiro"] as const).map((k) => <Input key={k} label={`Peso: ${k}`} type="number" value={d.risk.weights[k]} onChange={(e) => setDraft({ ...d, risk: { ...d.risk, weights: { ...d.risk.weights, [k]: num(e.target.value) } } })} />)}
          <Input label="Limiar moderado" type="number" value={d.risk.thresholds.moderado} onChange={(e) => setDraft({ ...d, risk: { ...d.risk, thresholds: { ...d.risk.thresholds, moderado: num(e.target.value) } } })} />
          <Input label="Limiar elevado" type="number" value={d.risk.thresholds.elevado} onChange={(e) => setDraft({ ...d, risk: { ...d.risk, thresholds: { ...d.risk.thresholds, elevado: num(e.target.value) } } })} />
          <Input label="Atraso financeiro relevante (dias)" type="number" value={d.risk.overdue_days} onChange={(e) => setDraft({ ...d, risk: { ...d.risk, overdue_days: num(e.target.value) } })} />
        </FormModal>
      )}

      {isOpen("policy-finance") && (
        <FormModal id="policy-finance" title="Pagamento das propinas" description="Os valores (propina, matrícula, mora) editam-se em Propinas → Tabela de preços." onSubmit={save(["finance"])} {...modalProps}>
          <Input label="N.º de prestações" type="number" value={d.finance.installments} onChange={(e) => setDraft({ ...d, finance: { ...d.finance, installments: num(e.target.value) } })} />
          <Input label="Dia de vencimento" type="number" value={d.finance.due_day} onChange={(e) => setDraft({ ...d, finance: { ...d.finance, due_day: num(e.target.value) } })} />
          <Input label="Lembretes (dias antes, vírgulas)" value={d.finance.reminder_days.join(", ")} onChange={(e) => setDraft({ ...d, finance: { ...d.finance, reminder_days: list(e.target.value) } })} />
        </FormModal>
      )}
    </div>
  );
}
