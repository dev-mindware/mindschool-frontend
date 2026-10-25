"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Can,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  EmptyState,
  FormModal,
  FormSelect,
  HelpHint,
  Icon,
  Input,
  PercInput,
  TitleList,
  Badge,
} from "@/components";
import { deepMerge, patchSettings, readRawSettings } from "@/services/school-settings-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { icons } from "lucide-react";

/** Valores por omissão recomendados pelo Ministério da Educação de Angola (MED). */
const DEFAULTS = {
  evaluation: {
    mt_weights: { mac: 1, mas: 1, pp: 1 },
    mt_rounding: "integer",
    absent_policy: "zero",
    pass_mark: 10,
    review_window_days: 10,
    council_min_attendees: 3,
    final_exam: {
      admission_min_mfd: 7,
      weight_mfd: 50,
      recurso_enabled: true,
      melhoria_enabled: true,
    },
    exception: { enabled: true, class_level_min: 7, class_level_max: 8, max_subjects: 2, min_mark: 7, max_mark: 9 },
  },
  admission: {
    entrance_exam_required_level_numbers: [] as number[],
    min_pass_score: 10,
    waitlist_tiebreak: "submission_order",
  },
  calendar: {
    lective_weekdays: [1, 2, 3, 4, 5],
    summary_deadline_days: 1,
    enforce_lective_attendance: false,
  },
  risk: {
    weights: { frequencia: 1, desempenho: 1, financeiro: 1 },
    thresholds: { moderado: 35, elevado: 65 },
    overdue_days: 30,
  },
  finance: {
    installments: 10,
    due_day: 20,
    reminder_days: [5, 2] as number[],
  },
} as const;

type Settings = {
  evaluation: {
    mt_weights: { mac: number; mas: number; pp: number };
    mt_rounding: string;
    absent_policy: string;
    pass_mark: number;
    review_window_days: number;
    council_min_attendees: number;
    final_exam: {
      admission_min_mfd: number;
      weight_mfd: number;
      recurso_enabled: boolean;
      melhoria_enabled: boolean;
    };
    exception: { enabled: boolean; class_level_min: number; class_level_max: number; max_subjects: number; min_mark: number; max_mark: number };
  };
  admission: {
    entrance_exam_required_level_numbers: number[];
    min_pass_score: number | null;
    waitlist_tiebreak: string;
  };
  calendar: {
    lective_weekdays: number[];
    summary_deadline_days: number;
    enforce_lective_attendance: boolean;
  };
  risk: {
    weights: { frequencia: number; desempenho: number; financeiro: number };
    thresholds: { moderado: number; elevado: number };
    overdue_days: number;
  };
  finance: {
    installments: number;
    due_day: number;
    reminder_days: number[];
  };
};

type Block = keyof Settings;

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const num = (v: string) => (v === "" ? 0 : Number(v));
const list = (v: string) =>
  v
    .split(",")
    .map((x) => Number(x.trim()))
    .filter((x) => Number.isInteger(x) && x > 0);

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm sm:col-span-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <span className="text-xs font-medium text-foreground">{label}</span>
    </label>
  );
}

function PolicyCard({
  icon,
  title,
  hint,
  impact,
  badge,
  rows,
  onEdit,
}: {
  icon: keyof typeof icons;
  title: string;
  hint: string;
  /** Quando e onde a alteração produz efeito (e o que não altera). */
  impact?: string;
  badge?: string;
  rows: Array<[string, ReactNode]>;
  onEdit: () => void;
}) {
  return (
    <Card className="h-full gap-0 py-4 border-border/70 hover:border-border transition-all">
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-4 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name={icon} className="size-4" />
            </span>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {badge && (
              <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{hint}</p>
          {impact && (
            <p className="flex items-start gap-1 text-[11px] text-muted-foreground/90">
              <Icon name="Info" className="mt-0.5 size-3 shrink-0" />
              {impact}
            </p>
          )}
        </div>
        <Can permission="school:update">
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0 h-8 text-xs" onClick={onEdit}>
            <Icon name="Pencil" className="size-3" />
            Configurar
          </Button>
        </Can>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {k}
              </dt>
              <dd className="font-semibold text-foreground text-xs mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** Políticas da escola: parâmetros explicativos, presets do MED, simulador didático de MT e modais ajustados. */
export function PoliciesPageContent() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const { open, openModal } = useModal();
  const raw = useQuery({
    queryKey: ["settings-raw", schoolId],
    queryFn: readRawSettings,
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
  });

  const [s, setS] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  // Estados do Simulador Didático de Notas
  const [simMac, setSimMac] = useState<number>(12);
  const [simMas, setSimMas] = useState<number>(14);
  const [simPp, setSimPp] = useState<number>(9);

  useEffect(() => {
    if (raw.data) {
      setS(deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), raw.data) as unknown as Settings);
    }
  }, [raw.data]);

  const edit = (id: string) => {
    setDraft(JSON.parse(JSON.stringify(s)) as Settings);
    openModal(id);
  };

  const save = (blocks: Block[]) => async () => {
    if (!draft) return;
    const w = draft.evaluation.mt_weights;
    if (blocks.includes("evaluation") && w.mac + w.mas + w.pp <= 0) {
      ErrorMessage("Os pesos MAC, MAS e PP não podem ser todos 0: a média trimestral nunca se calcularia.");
      throw new Error("invalid_weights");
    }
    const x = draft.evaluation.exception;
    if (blocks.includes("evaluation") && (x.class_level_min > x.class_level_max || x.min_mark > x.max_mark)) {
      ErrorMessage("Na exceção, o início tem de ser menor ou igual ao fim (classes e notas).");
      throw new Error("invalid_exception");
    }
    if (blocks.includes("risk") && draft.risk.thresholds.moderado >= draft.risk.thresholds.elevado) {
      ErrorMessage("O limiar «Moderado» tem de ser menor que o «Elevado».");
      throw new Error("invalid_thresholds");
    }
    setSaving(true);
    try {
      await patchSettings(
        Object.fromEntries(blocks.map((b) => [b, draft[b]])) as Record<string, unknown>
      );
      SucessMessage("Políticas escolares guardadas com sucesso.");
      await qc.invalidateQueries({ queryKey: ["settings-raw", schoolId] });
      void qc.invalidateQueries({ queryKey: ["school", schoolId] });
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar as alterações."));
      throw e;
    } finally {
      setSaving(false);
    }
  };

  function applyPreset(presetType: "secundario_geral" | "primario_i_ciclo" | "tecnico_profissional") {
    if (!s) return;
    let patch: Partial<Settings> = {};
    if (presetType === "secundario_geral") {
      patch = {
        evaluation: {
          ...s.evaluation,
          mt_weights: { mac: 1, mas: 1, pp: 1 },
          mt_rounding: "integer",
          absent_policy: "zero",
          pass_mark: 10,
          final_exam: { admission_min_mfd: 7, weight_mfd: 50, recurso_enabled: true, melhoria_enabled: true },
        },
      };
      SucessMessage("Preset 'Ensino Secundário Geral (MED)' carregado.");
    } else if (presetType === "primario_i_ciclo") {
      patch = {
        evaluation: {
          ...s.evaluation,
          mt_weights: { mac: 1, mas: 1, pp: 1 },
          mt_rounding: "integer",
          absent_policy: "zero",
          pass_mark: 10,
          final_exam: { admission_min_mfd: 7, weight_mfd: 40, recurso_enabled: false, melhoria_enabled: false },
        },
        admission: { ...s.admission, entrance_exam_required_level_numbers: [] },
      };
      SucessMessage("Preset 'Ensino Primário & I Ciclo (MED)' carregado.");
    } else {
      patch = {
        evaluation: {
          ...s.evaluation,
          mt_weights: { mac: 1, mas: 1, pp: 2 },
          mt_rounding: "integer",
          absent_policy: "zero",
          pass_mark: 10,
          final_exam: { admission_min_mfd: 8, weight_mfd: 50, recurso_enabled: true, melhoria_enabled: true },
        },
      };
      SucessMessage("Preset 'Ensino Técnico-Profissional (MED)' carregado.");
    }

    setSaving(true);
    patchSettings(patch)
      .then(async () => {
        await qc.invalidateQueries({ queryKey: ["settings-raw", schoolId] });
        void qc.invalidateQueries({ queryKey: ["school", schoolId] });
      })
      .catch((e) => ErrorMessage(getApiErrorMessage(e, "Erro ao aplicar preset.")))
      .finally(() => setSaving(false));
  }

  // Cálculo da simulação de MT com base nos pesos ativos
  const simResult = useMemo(() => {
    if (!s) return { rawMt: 0, roundedMt: 0, passed: false };
    const w = s.evaluation.mt_weights;
    const totalW = w.mac + w.mas + w.pp;
    if (totalW <= 0) return { rawMt: 0, roundedMt: 0, passed: false };
    const raw = (simMac * w.mac + simMas * w.mas + simPp * w.pp) / totalW;
    const rounded = s.evaluation.mt_rounding === "integer" ? Math.round(raw) : Number(raw.toFixed(2));
    return {
      rawMt: Number(raw.toFixed(2)),
      roundedMt: rounded,
      passed: rounded >= s.evaluation.pass_mark,
    };
  }, [s, simMac, simMas, simPp]);

  if (raw.isLoading || !s)
    return <div className="text-xs text-muted-foreground p-4">A carregar políticas da escola…</div>;
  if (raw.isError)
    return (
      <EmptyState
        icon="Lock"
        title="Sem acesso"
        description="Não foi possível carregar as políticas da escola."
      />
    );

  const d = draft ?? s;
  const ev = d.evaluation;
  const setEv = (patch: Partial<Settings["evaluation"]>) =>
    setDraft({ ...d, evaluation: { ...ev, ...patch } });
  const yn = (v: boolean) => (v ? "Sim" : "Não");
  const modalProps = { isLoading: saving, size: "lg" as const };
  const isOpen = (id: string) => Boolean(open[id]);

  return (
    <div className="space-y-6">
      <TitleList
        title="Políticas da Escola"
        suTitle="Parâmetros regulamentares de avaliação contínua, exames finais, provas de acesso, assiduidade e risco de abandono escolar alinhados com o Ministério da Educação (MED)."
      />

      {/* Barra de Presets Rápidos Recomendados */}
      <div className="rounded-xl border border-border/60 bg-gradient-to-r from-muted/40 via-card to-muted/30 p-4 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon name="Sparkles" className="size-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-foreground">Modelos Oficiais Recomendados (MED Angola)</p>
              <p className="text-[11px] text-muted-foreground">
                Aplique com um clique a parametrização recomendada para o seu subsistema de ensino.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => applyPreset("primario_i_ciclo")}
              className="h-8 text-xs font-medium"
            >
              Primário & I Ciclo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => applyPreset("secundario_geral")}
              className="h-8 text-xs font-medium"
            >
              Secundário Geral (II Ciclo)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => applyPreset("tecnico_profissional")}
              className="h-8 text-xs font-medium"
            >
              Técnico-Profissional
            </Button>
          </div>
        </div>
      </div>

      {/* Simulador Interativo Didático da Média Trimestral (MT) */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Calculator" className="size-4 text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Simulador Didáctico da Média Trimestral (MT)
            </h4>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Fórmula: (MAC×{s.evaluation.mt_weights.mac} + MAS×{s.evaluation.mt_weights.mas} + PP×{s.evaluation.mt_weights.pp}) /{" "}
            {s.evaluation.mt_weights.mac + s.evaluation.mt_weights.mas + s.evaluation.mt_weights.pp}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Os pesos são relativos, não notas: cada componente vale a sua parte do total.{" "}
          {(() => {
            const w = s.evaluation.mt_weights;
            const t = w.mac + w.mas + w.pp;
            if (t <= 0) return "Com todos os pesos a 0 a MT nunca se calcula: ponha pelo menos um acima de 0.";
            const p = (x: number) => `${Math.round((x / t) * 100)}%`;
            return `Agora: MAC ${p(w.mac)}, MAS ${p(w.mas)}, PP ${p(w.pp)}. Um peso 0 tira esse componente da média. Esta MT só é positiva a partir de ${s.evaluation.pass_mark} valores.`;
          })()}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 items-end">
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">MAC (Contínua) <HelpHint term="mac" /></label>
            <Input
              type="quantity"
              min={0}
              max={20}
              step={0.5}
              value={simMac}
              onChange={(e) => setSimMac(Number(e.target.value))}
              className="h-8 text-xs font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">MAS (Sistemática) <HelpHint term="mas" /></label>
            <Input
              type="quantity"
              min={0}
              max={20}
              step={0.5}
              value={simMas}
              onChange={(e) => setSimMas(Number(e.target.value))}
              className="h-8 text-xs font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">PP (Prova Periódica) <HelpHint term="pp" /></label>
            <Input
              type="quantity"
              min={0}
              max={20}
              step={0.5}
              value={simPp}
              onChange={(e) => setSimPp(Number(e.target.value))}
              className="h-8 text-xs font-semibold"
            />
          </div>
          <div className="rounded-lg bg-card border p-2 text-center space-y-0.5">
            <p className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground uppercase font-bold">Resultado MT <HelpHint term="mt" /></p>
            <p className="text-sm font-bold text-foreground">
              {simResult.roundedMt} valores{" "}
              <span className="text-[10px] font-normal text-muted-foreground">
                ({simResult.rawMt} real)
              </span>
            </p>
            <Badge
              variant="outline"
              className={
                simResult.passed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[9px] py-0 h-4"
                  : "border-destructive/30 bg-destructive/10 text-destructive text-[9px] py-0 h-4"
              }
            >
              {simResult.passed ? "MT positiva" : "MT negativa"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Grid de Cartões de Políticas */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PolicyCard
          icon="ClipboardCheck"
          title="Avaliação Pedagógica"
          hint="Pesos de cálculo da MT (MAC, MAS, PP), regra de faltas e arredondamento."
          impact="Aplica-se às mini-pautas em curso, que se recalculam. As pautas já fechadas mantêm o resultado guardado."
          badge="Normativo MED"
          onEdit={() => edit("policy-evaluation")}
          rows={[
            [
              "Pesos MAC / MAS / PP",
              `${s.evaluation.mt_weights.mac} / ${s.evaluation.mt_weights.mas} / ${s.evaluation.mt_weights.pp}`,
            ],
            [
              "Critério de Arredondamento",
              s.evaluation.mt_rounding === "integer" ? "Inteiro (Padrão MED)" : "2 Casas Decimais",
            ],
            [
              "Falta a Avaliação",
              s.evaluation.absent_policy === "zero"
                ? "Atribuição de 0 valores"
                : "Excluída do cálculo da média",
            ],
            ["Nota Mínima de Transição", `${s.evaluation.pass_mark} valores`],
            ["Prazo de Reapreciação de Notas", `${s.evaluation.review_window_days} dias após o fecho da pauta`],
            ["Quórum Mínimo do Conselho", `${s.evaluation.council_min_attendees} docentes`],
          ]}
        />

        <PolicyCard
          icon="Scale"
          title="Exceção «Transita com apoio»"
          hint="Quando um aluno com disciplinas negativas pode, mesmo assim, transitar com apoio pedagógico."
          impact="Aplica-se às propostas de transição geradas a partir de agora (ao fechar o último período). Decisões já confirmadas pelo Conselho não mudam."
          badge="Regime especial"
          onEdit={() => edit("policy-exception")}
          rows={[
            ["Regime ativo", yn(s.evaluation.exception.enabled)],
            ["Classes abrangidas", `${s.evaluation.exception.class_level_min}.ª a ${s.evaluation.exception.class_level_max}.ª`],
            ["Máx. de disciplinas negativas", `${s.evaluation.exception.max_subjects}`],
            ["Intervalo de notas admitido", `${s.evaluation.exception.min_mark} a ${s.evaluation.exception.max_mark} valores`],
          ]}
        />

        <PolicyCard
          icon="GraduationCap"
          title="Exames Finais & Recursos"
          hint="Regras de admissão a exame, pesos da MFD e épocas de melhoria."
          impact="Aplica-se às chamadas de exame abertas a partir de agora. Notas de exame já lançadas não mudam."
          badge="Exames Escolares"
          onEdit={() => edit("policy-final-exam")}
          rows={[
            ["MFD Mínima para Admissão", `${s.evaluation.final_exam.admission_min_mfd} valores`],
            ["Peso da MFD na Nota Final", `${s.evaluation.final_exam.weight_mfd}%`],
            ["Peso do Exame na Nota Final", `${100 - s.evaluation.final_exam.weight_mfd}%`],
            ["Exame de Recurso Habilitado", yn(s.evaluation.final_exam.recurso_enabled)],
            ["Exame de Melhoria de Nota", yn(s.evaluation.final_exam.melhoria_enabled)],
          ]}
        />

        <PolicyCard
          icon="UserPlus"
          title="Admissões & Acesso"
          hint="Classes sujeitas a exame de acesso e critério de desempate."
          impact="Aplica-se às candidaturas novas e às que ainda não foram decididas."
          onEdit={() => edit("policy-admission")}
          rows={[
            [
              "Classes com Prova de Acesso",
              s.admission.entrance_exam_required_level_numbers.length
                ? s.admission.entrance_exam_required_level_numbers.map((c) => `${c}ª Classe`).join(", ")
                : "Nenhuma obrigatória: o acesso direto faz-se em «Cadastrar Aluno»; a candidatura serve para quem presta prova",
            ],
            [
              "Nota Mínima de Entrada",
              s.admission.min_pass_score ? `${s.admission.min_pass_score} valores` : "Sem nota de corte",
            ],
            [
              "Critério de Desempate",
              s.admission.waitlist_tiebreak === "age" ? "Prioridade por Idade" : "Ordem de Submissão",
            ],
          ]}
        />

        <PolicyCard
          icon="CalendarDays"
          title="Calendário & Assiduidade"
          hint="Dias letivos de funcionamento e prazos para lançamento de sumários."
          impact="Os dias letivos regeneram o calendário do ano. Faltas já lançadas não são apagadas."
          onEdit={() => edit("policy-calendar")}
          rows={[
            [
              "Dias Letivos Semanais",
              s.calendar.lective_weekdays.map((n) => WEEKDAYS[n - 1]).join(", "),
            ],
            ["Prazo para Registo de Sumário", `${s.calendar.summary_deadline_days} dia(s)`],
            [
              "Bloquear presenças em dias não letivos",
              s.calendar.enforce_lective_attendance ? "Sim (Estrito)" : "Não (Apenas aviso)",
            ],
          ]}
        />

        <PolicyCard
          icon="TriangleAlert"
          title="Risco de Abandono Escolar"
          hint="Ponderação tripla para alerta precoce de desistência de estudantes."
          impact="Aplica-se aos cálculos de risco seguintes (funcionalidade do plano Profissional). Os alertas já criados não mudam."
          badge="Alerta Precoce"
          onEdit={() => edit("policy-risk")}
          rows={[
            [
              "Ponderação (Assiduidade / Notas / Propinas)",
              `${s.risk.weights.frequencia} : ${s.risk.weights.desempenho} : ${s.risk.weights.financeiro}`,
            ],
            ["Limiar de Alerta Moderado", `${s.risk.thresholds.moderado} pts`],
            ["Limiar de Alerta Elevado", `${s.risk.thresholds.elevado} pts`],
            ["Atraso Financeiro com Impacto", `${s.risk.overdue_days} dias`],
          ]}
        />

        <PolicyCard
          icon="Wallet"
          title="Regime Financeiro & Propinas"
          hint="Prestações do ano letivo e agendamento de cobrança. Valores, tolerância e multas definem-se em Propinas › Planos."
          impact="Aplica-se às propinas geradas em novas matrículas. Faturas já emitidas não mudam."
          onEdit={() => edit("policy-finance")}
          rows={[
            ["Número de Prestações", `${s.finance.installments} mensalidades`],
            ["Dia Limite de Vencimento", `Dia ${s.finance.due_day} de cada mês`],
            [
              "Lembretes Preventivos",
              s.finance.reminder_days.length
                ? `${s.finance.reminder_days.join(" e ")} dias antes`
                : "Sem envio prévio",
            ],
          ]}
        />
      </div>

      {/* Modais de Configuração no Padrão MindGest (w-max, grid-cols-1, sem bordas internas) */}
      {isOpen("policy-evaluation") && (
        <FormModal
          id="policy-evaluation"
          title="Política de Avaliação Pedagógica"
          description="Como se calcula a Média Trimestral (MT) e como são tratadas faltas e pedidos de reapreciação."
          onSubmit={save(["evaluation"])}
          {...modalProps}
        >
          <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Peso MAC (0–10)"
                type="quantity"
                min={0}
                max={10}
                step={1}
                value={ev.mt_weights.mac}
                onChange={(e) =>
                  setEv({ mt_weights: { ...ev.mt_weights, mac: Math.max(0, Math.min(10, num(e.target.value))) } })
                }
              />
              <Input
                label="Peso MAS (0–10)"
                type="quantity"
                min={0}
                max={10}
                step={1}
                value={ev.mt_weights.mas}
                onChange={(e) =>
                  setEv({ mt_weights: { ...ev.mt_weights, mas: Math.max(0, Math.min(10, num(e.target.value))) } })
                }
              />
              <Input
                label="Peso PP (0–10)"
                type="quantity"
                min={0}
                max={10}
                step={1}
                value={ev.mt_weights.pp}
                onChange={(e) =>
                  setEv({ mt_weights: { ...ev.mt_weights, pp: Math.max(0, Math.min(10, num(e.target.value))) } })
                }
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {(() => {
                const w = ev.mt_weights;
                const t = w.mac + w.mas + w.pp;
                if (t <= 0) return "Ponha pelo menos um peso acima de 0: com todos a 0 a MT nunca se calcula.";
                const p = (x: number) => `${Math.round((x / t) * 100)}%`;
                return `São pesos relativos. Com estes valores: MAC ${p(w.mac)}, MAS ${p(w.mas)}, PP ${p(w.pp)}. Um peso 0 tira o componente da média. Aplica-se às mini-pautas em curso; as pautas já fechadas mantêm o resultado guardado.`;
              })()}
            </p>
            <FormSelect
              label="Arredondamento da Média Trimestral"
              value={ev.mt_rounding}
              onValueChange={(v) => setEv({ mt_rounding: v })}
              options={[
                { value: "integer", label: "Número Inteiro (Exigido pelo MED em pautas)" },
                { value: "two_decimals", label: "Duas Casas Decimais" },
              ]}
            />
            <FormSelect
              label="Tratamento de Falta a Avaliação"
              value={ev.absent_policy}
              onValueChange={(v) => setEv({ absent_policy: v })}
              options={[
                { value: "zero", label: "Conta como 0 valores no trimestre" },
                { value: "excluded", label: "Não entra no cálculo da média" },
              ]}
            />
            <Input
              label="Nota Mínima de Aprovação"
              type="quantity"
              min={0}
              max={20}
              step={1}
              value={ev.pass_mark}
              onChange={(e) => setEv({ pass_mark: Math.max(0, Math.min(20, num(e.target.value))) })}
            />
            <Input
              label="Prazo para pedir reapreciação (dias após o fecho da pauta)"
              type="quantity"
              min={1}
              max={60}
              step={1}
              value={ev.review_window_days}
              onChange={(e) => setEv({ review_window_days: Math.max(1, Math.min(60, num(e.target.value))) })}
            />
            <Input
              label="Quórum Mínimo para Conselho de Turma"
              type="quantity"
              min={1}
              max={20}
              step={1}
              value={ev.council_min_attendees}
              onChange={(e) => setEv({ council_min_attendees: Math.max(1, Math.min(20, num(e.target.value))) })}
            />
          </div>
        </FormModal>
      )}

      {isOpen("policy-exception") && (
        <FormModal
          id="policy-exception"
          title="Exceção «Transita com apoio»"
          description="Regra aplicada ao propor a transição de classe, depois de fechado o último período."
          onSubmit={save(["evaluation"])}
          {...modalProps}
        >
          <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
            <Check
              label="Regime ativo"
              checked={ev.exception.enabled}
              onChange={(v) => setEv({ exception: { ...ev.exception, enabled: v } })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Da classe (n.º)"
                type="quantity"
                min={0}
                max={13}
                step={1}
                value={ev.exception.class_level_min}
                onChange={(e) => setEv({ exception: { ...ev.exception, class_level_min: Math.max(0, Math.min(13, num(e.target.value))) } })}
              />
              <Input
                label="Até à classe (n.º)"
                type="quantity"
                min={0}
                max={13}
                step={1}
                value={ev.exception.class_level_max}
                onChange={(e) => setEv({ exception: { ...ev.exception, class_level_max: Math.max(0, Math.min(13, num(e.target.value))) } })}
              />
            </div>
            <Input
              label="Máximo de disciplinas negativas"
              type="quantity"
              min={0}
              max={10}
              step={1}
              value={ev.exception.max_subjects}
              onChange={(e) => setEv({ exception: { ...ev.exception, max_subjects: Math.max(0, Math.min(10, num(e.target.value))) } })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nota mínima admitida"
                type="quantity"
                min={0}
                max={20}
                step={0.5}
                value={ev.exception.min_mark}
                onChange={(e) => setEv({ exception: { ...ev.exception, min_mark: Math.max(0, Math.min(20, num(e.target.value))) } })}
              />
              <Input
                label="Nota máxima admitida"
                type="quantity"
                min={0}
                max={20}
                step={0.5}
                value={ev.exception.max_mark}
                onChange={(e) => setEv({ exception: { ...ev.exception, max_mark: Math.max(0, Math.min(20, num(e.target.value))) } })}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {ev.exception.enabled
                ? `Um aluno da ${ev.exception.class_level_min}.ª à ${ev.exception.class_level_max}.ª classe com até ${ev.exception.max_subjects} disciplina(s) negativa(s), todas entre ${ev.exception.min_mark} e ${ev.exception.max_mark} valores e nenhuma delas Língua Portuguesa ou Matemática, passa a «transita com apoio». Fora disto, quem tiver alguma disciplina abaixo de ${ev.pass_mark} não transita. É sempre uma proposta: a decisão final é do Conselho de Turma.`
                : `Sem o regime, qualquer disciplina abaixo de ${ev.pass_mark} valores faz a proposta ser «não transita».`}
            </p>
          </div>
        </FormModal>
      )}

      {isOpen("policy-final-exam") && (
        <FormModal
          id="policy-final-exam"
          title="Política de Exames Finais & Recursos"
          description="Parâmetros de acesso e ponderação das provas de exame final."
          onSubmit={save(["evaluation"])}
          {...modalProps}
        >
          <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
            <Input
              label="MFD Mínima para Admissão a Exame"
              type="quantity"
              min={0}
              max={20}
              step={0.5}
              value={ev.final_exam.admission_min_mfd}
              onChange={(e) =>
                setEv({
                  final_exam: { ...ev.final_exam, admission_min_mfd: num(e.target.value) },
                })
              }
            />
            <PercInput
              label="Peso da MFD na Classificação Final"
              value={ev.final_exam.weight_mfd}
              onChange={(val) =>
                setEv({ final_exam: { ...ev.final_exam, weight_mfd: val } })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              A classificação final = MFD × {ev.final_exam.weight_mfd}% + exame × {100 - ev.final_exam.weight_mfd}%. Os dois pesos somam sempre 100.
              A MFD mínima é a nota abaixo da qual o aluno não é admitido ao exame na 1.ª chamada. A melhoria só vale se a nota nova for maior.
            </p>
            <Check
              label="Permitir Exame de Recurso aos alunos não aprovados"
              checked={ev.final_exam.recurso_enabled}
              onChange={(v) => setEv({ final_exam: { ...ev.final_exam, recurso_enabled: v } })}
            />
            <Check
              label="Permitir Exame de Melhoria de Nota"
              checked={ev.final_exam.melhoria_enabled}
              onChange={(v) => setEv({ final_exam: { ...ev.final_exam, melhoria_enabled: v } })}
            />
          </div>
        </FormModal>
      )}

      {isOpen("policy-admission") && (
        <FormModal
          id="policy-admission"
          title="Política de Admissões & Inscrições"
          description="Classes que exigem exame de acesso e critério de desempate."
          onSubmit={save(["admission"])}
          {...modalProps}
        >
          <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
            <Input
              label="Classes com Prova de Acesso (números separados por vírgula)"
              placeholder="Ex: 7, 10"
              value={d.admission.entrance_exam_required_level_numbers.join(", ")}
              onChange={(e) =>
                setDraft({
                  ...d,
                  admission: {
                    ...d.admission,
                    entrance_exam_required_level_numbers: list(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Nota Mínima para Aprovação na Prova (0-20)"
              type="quantity"
              min={0}
              max={20}
              step={0.5}
              value={d.admission.min_pass_score ?? ""}
              onChange={(e) =>
                setDraft({
                  ...d,
                  admission: {
                    ...d.admission,
                    min_pass_score: e.target.value === "" ? null : Number(e.target.value),
                  },
                })
              }
            />
            <FormSelect
              label="Critério de Desempate na Lista de Espera"
              value={d.admission.waitlist_tiebreak}
              onValueChange={(v) => setDraft({ ...d, admission: { ...d.admission, waitlist_tiebreak: v } })}
              options={[
                { value: "submission_order", label: "Ordem Cronológica de Inscrição" },
                { value: "age", label: "Prioridade ao Aluno Mais Jovem" },
              ]}
            />
          </div>
        </FormModal>
      )}

      {isOpen("policy-calendar") && (
        <FormModal
          id="policy-calendar"
          title="Calendário Escolar & Assiduidade"
          onSubmit={save(["calendar"])}
          {...modalProps}
        >
          <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground">Dias Letivos de Funcionamento</span>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((w, i) => {
                  const n = i + 1;
                  const on = d.calendar.lective_weekdays.includes(n);
                  return (
                    <Button
                      key={w}
                      type="button"
                      size="sm"
                      variant={on ? "default" : "outline"}
                      onClick={() =>
                        setDraft({
                          ...d,
                          calendar: {
                            ...d.calendar,
                            lective_weekdays: on
                              ? d.calendar.lective_weekdays.filter((x) => x !== n)
                              : [...d.calendar.lective_weekdays, n].sort(),
                          },
                        })
                      }
                      className="h-8 px-3 text-xs"
                    >
                      {w}
                    </Button>
                  );
                })}
              </div>
            </div>
            <Input
              label="Prazo para Lançamento do Sumário da Aula (dias)"
              type="quantity"
              min={1}
              max={30}
              step={1}
              value={d.calendar.summary_deadline_days}
              onChange={(e) =>
                setDraft({
                  ...d,
                  calendar: { ...d.calendar, summary_deadline_days: Math.max(1, Math.min(30, num(e.target.value))) },
                })
              }
            />
            <Check
              label="Bloquear registo de presenças em dias não letivos (por omissão apenas avisa)"
              checked={d.calendar.enforce_lective_attendance}
              onChange={(v) =>
                setDraft({
                  ...d,
                  calendar: { ...d.calendar, enforce_lective_attendance: v },
                })
              }
            />
          </div>
        </FormModal>
      )}

      {isOpen("policy-risk") && (
        <FormModal
          id="policy-risk"
          title="Risco de Abandono Escolar Precoce"
          description="Pesos das componentes e limiares (0–100) para intervenção pedagógica."
          onSubmit={save(["risk"])}
          {...modalProps}
        >
          <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Peso Frequência (0–10)"
                type="quantity"
                min={0}
                max={10}
                step={1}
                value={d.risk.weights.frequencia}
                onChange={(e) =>
                  setDraft({ ...d, risk: { ...d.risk, weights: { ...d.risk.weights, frequencia: Math.max(0, Math.min(10, num(e.target.value))) } } })
                }
              />
              <Input
                label="Peso Desempenho (0–10)"
                type="quantity"
                min={0}
                max={10}
                step={1}
                value={d.risk.weights.desempenho}
                onChange={(e) =>
                  setDraft({ ...d, risk: { ...d.risk, weights: { ...d.risk.weights, desempenho: Math.max(0, Math.min(10, num(e.target.value))) } } })
                }
              />
              <Input
                label="Peso Financeiro (0–10)"
                type="quantity"
                min={0}
                max={10}
                step={1}
                value={d.risk.weights.financeiro}
                onChange={(e) =>
                  setDraft({ ...d, risk: { ...d.risk, weights: { ...d.risk.weights, financeiro: Math.max(0, Math.min(10, num(e.target.value))) } } })
                }
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {(() => {
                const w = d.risk.weights;
                const t = w.frequencia + w.desempenho + w.financeiro;
                if (t <= 0) return "Com todos os pesos a 0 o risco fica sempre em 0 e nenhum aluno é sinalizado.";
                const p = (x: number) => `${Math.round((x / t) * 100)}%`;
                return `São pesos relativos. Com estes valores: assiduidade ${p(w.frequencia)}, notas ${p(w.desempenho)}, propinas ${p(w.financeiro)}. Se faltarem dados de um sinal (ex.: sem notas ainda), os outros são reescalados. Um peso 0 desliga esse sinal.`;
              })()}
            </p>
            <PercInput
              label="Limiar para Alerta Moderado (0–100)"
              value={d.risk.thresholds.moderado}
              onChange={(val) =>
                setDraft({
                  ...d,
                  risk: {
                    ...d.risk,
                    thresholds: { ...d.risk.thresholds, moderado: val },
                  },
                })
              }
            />
            <PercInput
              label="Limiar para Alerta Crítico / Elevado (0–100)"
              value={d.risk.thresholds.elevado}
              onChange={(val) =>
                setDraft({
                  ...d,
                  risk: {
                    ...d.risk,
                    thresholds: { ...d.risk.thresholds, elevado: val },
                  },
                })
              }
            />
            <Input
              label="Atraso Financeiro Relevante para Risco (dias)"
              type="quantity"
              min={1}
              max={180}
              step={1}
              value={d.risk.overdue_days}
              onChange={(e) =>
                setDraft({ ...d, risk: { ...d.risk, overdue_days: Math.max(1, Math.min(180, num(e.target.value))) } })
              }
            />
          </div>
        </FormModal>
      )}

      {isOpen("policy-finance") && (
        <FormModal
          id="policy-finance"
          title="Regime Financeiro & Prestações"
          description="Número de mensalidades e calendário base de faturação."
          onSubmit={save(["finance"])}
          {...modalProps}
        >
          <div className="grid grid-cols-1 gap-3.5 sm:col-span-2">
            <Input
              label="Número de Prestações no Ano Letivo"
              type="quantity"
              min={1}
              max={12}
              step={1}
              value={d.finance.installments}
              onChange={(e) =>
                setDraft({ ...d, finance: { ...d.finance, installments: Math.max(1, Math.min(12, num(e.target.value))) } })
              }
            />
            <Input
              label="Dia Limite de Vencimento"
              type="quantity"
              min={1}
              max={31}
              step={1}
              value={d.finance.due_day}
              onChange={(e) =>
                setDraft({ ...d, finance: { ...d.finance, due_day: Math.max(1, Math.min(31, num(e.target.value))) } })
              }
            />
            <Input
              label="Dias de Antecedência para Lembretes (separados por vírgula)"
              value={d.finance.reminder_days.join(", ")}
              onChange={(e) =>
                setDraft({ ...d, finance: { ...d.finance, reminder_days: list(e.target.value) } })
              }
            />
          </div>
        </FormModal>
      )}
    </div>
  );
}
