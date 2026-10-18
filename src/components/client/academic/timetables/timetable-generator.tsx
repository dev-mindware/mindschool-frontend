"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Badge, Button, FormModal, FormSelect, Icon } from "@/components";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntitled } from "@/hooks/common/use-entitled";
import { timetablesService, type ApiGeneration } from "@/services/timetables-service";
import { usePlanUpgradeModal } from "@/stores/plan/use-plan-upgrade-modal-store";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const ALL = "todas";
const SOFT_LABEL: Record<string, string> = {
  teacher_gap: "buracos de professor", subject_repeated_same_day: "disciplina repetida no mesmo dia", daily_load_exceeded: "dias carregados",
  double_period_missing: "sem tempo duplo", opposite_shift_preferred: "turno oposto preferido", min_weekly_periods: "poucos tempos semanais", room_too_small: "sala pequena",
};

/**
 * Gerador automático de horários (Enterprise): calcula uma proposta para as aulas em falta, mostra-a e só grava depois de
 * confirmada. Fora do plano, o botão leva ao convite de upgrade.
 */
export function TimetableGenerator({ timetableId, sections }: { timetableId: string; sections: Array<{ id: string; name: string }> }) {
  const entitled = useEntitled({ feature: "timetable_solver", minPlan: "enterprise" });
  const planModal = usePlanUpgradeModal();
  const { openModal } = useModal();
  const qc = useQueryClient();
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const [seed, setSeed] = useState(1);
  const [replace, setReplace] = useState(false);
  const [section, setSection] = useState(ALL);
  const [proposal, setProposal] = useState<ApiGeneration | null>(null);

  const request = (mode: "preview" | "apply", nextSeed = seed) => ({ mode, replace, seed: nextSeed, ...(section !== ALL ? { sectionIds: [section] } : {}) });
  const preview = useMutation({ mutationFn: (s: number) => timetablesService.generate(timetableId, request("preview", s)), onSuccess: setProposal });
  const apply = useMutation({
    mutationFn: () => timetablesService.generate(timetableId, request("apply")),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ["timetables", schoolId] });
      void qc.invalidateQueries({ queryKey: ["timetable-entries", schoolId] });
      SucessMessage(`${r.applied?.created ?? 0} aula(s) criada(s)${r.applied?.replaced ? ` (${r.applied.replaced} substituída(s))` : ""}. Valide o horário para ver os avisos.`);
    },
  });
  const run = (s: number) => { setSeed(s); preview.mutateAsync(s).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível calcular a proposta."))); };

  const onClick = () => {
    if (!entitled) {
      planModal.open({ requiredPlan: "enterprise", featureName: "Gerador automático de horários", description: "O gerador automático propõe as aulas em falta respeitando professores, turmas e disponibilidades. Faz parte do plano Enterprise." });
      return;
    }
    setProposal(null);
    openModal("tt-generate");
    run(seed);
  };

  return (
    <>
      <Button size="sm" variant="outline" className="h-10 gap-1.5" onClick={onClick}>
        <Icon name={entitled ? "Sparkles" : "Lock"} className="size-4" />Gerar automaticamente
      </Button>
      <FormModal
        id="tt-generate" title="Gerar horário automaticamente" size="lg" submitLabel="Aplicar proposta"
        description="Propõe as aulas em falta sem conflitos de professor, turma ou disponibilidade. Só grava quando aplicar."
        isLoading={apply.isPending} disabled={!proposal || proposal.placements.length === 0 || preview.isPending}
        onSubmit={() => apply.mutateAsync().then(() => undefined).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível aplicar a proposta.")); throw e; })}
      >
        <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
          <FormSelect label="Turmas" value={section} onValueChange={(v) => { setSection(v); setProposal(null); }} options={[{ value: ALL, label: "Todas as turmas" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
          <label className="flex items-end gap-2 pb-2 text-sm">
            <Checkbox checked={replace} onCheckedChange={(v) => { setReplace(v === true); setProposal(null); }} />
            <span>Substituir as aulas já marcadas</span>
          </label>
        </div>
        {replace && <p className="text-xs text-amber-700 sm:col-span-2">As aulas actuais das turmas seleccionadas serão apagadas e substituídas pela proposta.</p>}

        <div className="space-y-3 sm:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="outline" disabled={preview.isPending} onClick={() => run(seed)}>
              <Icon name="RefreshCw" className="mr-1 size-4" />{preview.isPending ? "A calcular…" : "Recalcular"}
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={preview.isPending} onClick={() => run(seed + 1)}>Outra proposta</Button>
            {proposal && <span className="text-xs text-muted-foreground">Proposta #{proposal.seed}</span>}
          </div>

          {proposal && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-2"><p className="text-lg font-semibold tabular-nums">{proposal.placed_periods}</p><p className="text-[11px] text-muted-foreground">tempos a colocar</p></div>
                <div className={`rounded-lg border p-2 ${proposal.unplaced_periods > 0 ? "border-destructive/40" : ""}`}><p className="text-lg font-semibold tabular-nums">{proposal.unplaced_periods}</p><p className="text-[11px] text-muted-foreground">sem lugar</p></div>
                <div className="rounded-lg border p-2"><p className="text-lg font-semibold tabular-nums">{proposal.score}</p><p className="text-[11px] text-muted-foreground">pontuação</p></div>
              </div>

              {proposal.soft.length > 0 && (
                <p className="text-xs text-muted-foreground">Avisos: {proposal.soft.map((s) => `${s.count} ${SOFT_LABEL[s.code] ?? s.code}`).join(" · ")}</p>
              )}

              {proposal.unplaced.length > 0 && (
                <Alert className="border-destructive/40">
                  <p className="font-semibold">Ficam por colocar (resolva e volte a gerar):</p>
                  {proposal.unplaced.slice(0, 8).map((u, i) => (
                    <p key={i} className="text-sm text-destructive">• {u.section.name} — {u.subject} ({u.teacher}): {u.remaining} tempo(s). {u.message}</p>
                  ))}
                </Alert>
              )}

              {proposal.placements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Não há aulas por colocar: o horário já cumpre a carga semanal.</p>
              ) : (
                <div className="max-h-56 overflow-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-muted/60 text-left"><tr><th className="p-2">Turma</th><th className="p-2">Disciplina</th><th className="p-2">Professor</th><th className="p-2">Dia</th><th className="p-2">Hora</th></tr></thead>
                    <tbody>
                      {proposal.placements.slice(0, 120).map((p, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{p.section.name}</td><td className="p-2">{p.subject}{p.span > 1 && <Badge variant="outline" className="ml-1 text-[9px]">duplo</Badge>}</td>
                          <td className="p-2">{p.teacher}</td><td className="p-2">{p.weekday_label}</td><td className="p-2 font-mono">{p.start}–{p.end}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {proposal.placements.length > 120 && <p className="p-2 text-center text-[11px] text-muted-foreground">A mostrar 120 de {proposal.placements.length} aulas.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </FormModal>
    </>
  );
}
