"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  ButtonSubmit,
  FormSelect,
  GenericTable,
  Icon,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type Column,
} from "@/components";
import { Checkbox } from "@/components/ui/checkbox";
import { useEntitled } from "@/hooks/common/use-entitled";
import { cn } from "@/lib/utils";
import {
  timetablesService,
  type ApiGeneration,
  type ApiReadinessReport,
  type ApiSolverSuggestion,
} from "@/services/timetables-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { usePlanUpgradeModal } from "@/stores/plan/use-plan-upgrade-modal-store";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const ALL = "todas";
const MODAL_ID = "tt-generate";
const SOFT_LABEL: Record<string, string> = {
  teacher_gap: "buracos de professor",
  subject_repeated_same_day: "disciplina repetida no mesmo dia",
  daily_load_exceeded: "dias carregados",
  double_period_missing: "sem tempo duplo",
  opposite_shift_preferred: "turno oposto preferido",
  min_weekly_periods: "poucos tempos semanais",
  room_too_small: "sala pequena",
};

const PRIO_STYLE: Record<ApiSolverSuggestion["priority"], string> = {
  alta: "border-destructive/40 bg-destructive/[0.04]",
  media: "border-amber-500/40 bg-amber-500/[0.04]",
  baixa: "border-border bg-muted/20",
};

type PlacementRow = ApiGeneration["placements"][number] & { id: string };

/**
 * Gerador automático inteligente (Enterprise):
 * - Funciona com 1 clique mesmo antes de existir rascunho criado;
 * - Calcula pré-diagnóstico de prontidão, otimização multi-fase (salas + turno oposto + redução de janelas);
 * - Apresenta sugestões accionáveis explicadas pelos dados reais da escola antes de gravar.
 */
export function TimetableGenerator({
  timetableId,
  sections,
  readiness,
  variant = "outline",
  label = "Gerar com 1 clique",
  onOpenTeacherAvailability,
  onApplied,
}: {
  timetableId?: string;
  sections: Array<{ id: string; name: string }>;
  readiness?: ApiReadinessReport | null;
  variant?: "outline" | "default";
  label?: string;
  onOpenTeacherAvailability?: (teacherId: string) => void;
  onApplied?: (timetableId?: string | null) => void;
}) {
  const entitled = useEntitled({ feature: "timetable_solver", minPlan: "enterprise" });
  const roomsEnabled = useEntitled({ feature: "rooms" });
  const planModal = usePlanUpgradeModal();
  const { open, openModal, closeModal } = useModal();
  const qc = useQueryClient();
  const schoolId = useActiveSchoolStore((s) => s.schoolId);

  const [seed, setSeed] = useState(1);
  const [replace, setReplace] = useState(false);
  const [allocateRooms, setAllocateRooms] = useState(true);
  const [useOppositeShift, setUseOppositeShift] = useState(true);
  const [section, setSection] = useState(ALL);
  const [proposal, setProposal] = useState<ApiGeneration | null>(null);

  const buildReq = (mode: "preview" | "apply", nextSeed = seed) => ({
    mode,
    replace,
    seed: nextSeed,
    allocateRooms: roomsEnabled ? allocateRooms : false,
    useOppositeShift,
    ...(section !== ALL ? { sectionIds: [section] } : {}),
  });

  const execute = (req: ReturnType<typeof buildReq>) =>
    timetableId ? timetablesService.generate(timetableId, req) : timetablesService.quickGenerate(req);

  const preview = useMutation({
    mutationFn: (s: number) => execute(buildReq("preview", s)),
    onSuccess: setProposal,
  });

  const apply = useMutation({
    mutationFn: () => execute(buildReq("apply")),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ["timetables", schoolId] });
      void qc.invalidateQueries({ queryKey: ["timetable-entries", schoolId] });
      void qc.invalidateQueries({ queryKey: ["timetable-readiness", schoolId] });
      const lockedNote = r.applied?.preserved_locked
        ? ` ${r.applied.preserved_locked} aula(s) com sumários/ocorrências foram preservadas.`
        : "";
      SucessMessage(
        `${r.applied?.created ?? 0} aula(s) criada(s)${
          r.applied?.replaced ? ` (${r.applied.replaced} substituída(s))` : ""
        }.${lockedNote} Valide o horário para verificar avisos.`,
      );
      onApplied?.(r.timetable_id);
      closeModal(MODAL_ID);
    },
  });

  const run = (s: number) => {
    setSeed(s);
    preview
      .mutateAsync(s)
      .catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível calcular a proposta de horário.")));
  };

  const onClick = () => {
    if (!entitled) {
      planModal.open({
        requiredPlan: "enterprise",
        featureName: "Gerador automático inteligente de horários",
        description:
          "O motor inteligente gera horários completos respeitando disponibilidade docente, turmas, salas e turno oposto, com sugestões de resolução de conflitos. Faz parte do plano Enterprise.",
      });
      return;
    }
    setProposal(null);
    openModal(MODAL_ID);
    run(seed);
  };

  const columns: Column<PlacementRow>[] = [
    { key: "section", header: "Turma", render: (_, p) => p.section.name },
    {
      key: "subject",
      header: "Disciplina",
      render: (_, p) => (
        <span className="flex flex-wrap items-center gap-1">
          <span>{p.subject}</span>
          {p.span > 1 && (
            <Badge variant="outline" className="text-[9px]">
              duplo
            </Badge>
          )}
        </span>
      ),
    },
    { key: "teacher", header: "Professor", render: (_, p) => p.teacher },
    { key: "weekday_label", header: "Dia", render: (_, p) => p.weekday_label },
    {
      key: "start",
      header: "Hora",
      render: (_, p) => (
        <span className="font-mono text-xs">
          {p.start}–{p.end}
        </span>
      ),
    },
    ...(roomsEnabled
      ? [
          {
            key: "room" as const,
            header: "Sala",
            render: (_: unknown, p: PlacementRow) =>
              p.room ? (
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {p.room.code}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              ),
          },
        ]
      : []),
  ];

  const rows: PlacementRow[] = (proposal?.placements.slice(0, 150) ?? []).map((p, i) => ({
    ...p,
    id: `${p.section.id}-${p.weekday}-${p.start}-${i}`,
  }));

  const effectiveReadiness = proposal?.readiness ?? readiness;
  const suggestions = proposal?.suggestions ?? [];

  return (
    <>
      <Button size="sm" variant={variant} className="h-10 gap-1.5" onClick={onClick}>
        <Icon name={entitled ? "Sparkles" : "Lock"} className="size-4" />
        {label}
      </Button>
      <Sheet open={Boolean(open[MODAL_ID])} onOpenChange={(next) => !next && closeModal(MODAL_ID)}>
        <SheetContent className="flex flex-col gap-5 overflow-y-auto p-6 sm:max-w-3xl">
          <SheetHeader className="p-0">
            <SheetTitle>Motor inteligente de horários</SheetTitle>
            <SheetDescription>
              Analisa disponibilidade docente, turmas, salas e regras pedagógicas para propor um horário optimizado com 1 clique. Só grava após aplicar.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply
                .mutateAsync()
                .catch((err) => ErrorMessage(getApiErrorMessage(err, "Não foi possível aplicar a proposta.")));
            }}
            className="flex flex-1 flex-col gap-5"
          >
            <div className="space-y-3 rounded-xs border bg-muted/15 p-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <FormSelect
                  label="Âmbito de turmas"
                  value={section}
                  onValueChange={(v) => {
                    setSection(v);
                    setProposal(null);
                  }}
                  options={[
                    { value: ALL, label: "Todas as turmas do ano letivo" },
                    ...sections.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
                <div className="flex flex-col justify-end gap-2 pb-1">
                  <Label className="flex items-center gap-2 text-xs font-normal">
                    <Checkbox
                      checked={replace}
                      onCheckedChange={(v) => {
                        setReplace(v === true);
                        setProposal(null);
                      }}
                    />
                    <span>Substituir aulas já marcadas (preserva aulas com sumários)</span>
                  </Label>
                  {roomsEnabled && (
                    <Label className="flex items-center gap-2 text-xs font-normal">
                      <Checkbox
                        checked={allocateRooms}
                        onCheckedChange={(v) => {
                          setAllocateRooms(v === true);
                          setProposal(null);
                        }}
                      />
                      <span>Atribuir salas livres compatíveis automaticamente</span>
                    </Label>
                  )}
                  <Label className="flex items-center gap-2 text-xs font-normal">
                    <Checkbox
                      checked={useOppositeShift}
                      onCheckedChange={(v) => {
                        setUseOppositeShift(v === true);
                        setProposal(null);
                      }}
                    />
                    <span>Usar turno complementar para disciplinas de turno oposto</span>
                  </Label>
                </div>
              </div>

              {replace && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  As aulas sem ocorrências/sumários das turmas seleccionadas serão reorganizadas de raiz.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={preview.isPending}
                  onClick={() => run(seed)}
                >
                  <Icon name="RefreshCw" className={cn("mr-1 size-4", preview.isPending && "animate-spin")} />
                  {preview.isPending ? "A optimizar…" : "Recalcular"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={preview.isPending}
                  onClick={() => run(seed + 1)}
                >
                  <Icon name="Shuffle" className="mr-1 size-3.5" />
                  Alternativa #{seed + 1}
                </Button>
                {proposal && (
                  <span className="text-xs text-muted-foreground">
                    Proposta #{proposal.seed} • {proposal.attempts} iterações
                  </span>
                )}
              </div>
            </div>

            {effectiveReadiness && effectiveReadiness.issues.length > 0 && (
              <Alert className={effectiveReadiness.ready ? "border-amber-500/30 bg-amber-500/[0.04]" : "border-destructive/40 bg-destructive/[0.04]"}>
                <Icon name="Activity" className="size-4" />
                <AlertTitle>
                  Prontidão da escola: {effectiveReadiness.feasibility_score}/100 ({effectiveReadiness.summary.total_weekly_hours} tempos · {effectiveReadiness.summary.teachers_with_availability}/{effectiveReadiness.summary.teachers_total} docentes c/ restrições)
                </AlertTitle>
                <AlertDescription className="mt-1 space-y-1.5 text-xs">
                  {effectiveReadiness.issues.slice(0, 4).map((iss, idx) => (
                    <div key={`${iss.code}-${idx}`} className="flex flex-wrap items-center justify-between gap-2">
                      <span>• {iss.title}: {iss.description}</span>
                      {iss.action_type === "teacher_availability" && iss.teacher_id && onOpenTeacherAvailability && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-[11px]"
                          onClick={() => {
                            closeModal(MODAL_ID);
                            onOpenTeacherAvailability(iss.teacher_id!);
                          }}
                        >
                          Ajustar disponibilidade
                        </Button>
                      )}
                    </div>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {proposal && (
              <Tabs defaultValue={suggestions.length > 0 ? "suggestions" : "placements"} className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xs border bg-emerald-500/[0.04] p-2.5">
                    <p className="text-lg font-semibold tabular-nums">{proposal.placed_periods}</p>
                    <p className="text-[11px] text-muted-foreground">tempos colocados</p>
                  </div>
                  <div className={cn("rounded-xs border p-2.5", proposal.unplaced_periods > 0 && "border-destructive/40 bg-destructive/[0.04]")}>
                    <p className="text-lg font-semibold tabular-nums">{proposal.unplaced_periods}</p>
                    <p className="text-[11px] text-muted-foreground">sem lugar</p>
                  </div>
                  <div className="rounded-xs border p-2.5">
                    <p className="text-lg font-semibold tabular-nums">{proposal.score}/100</p>
                    <p className="text-[11px] text-muted-foreground">pontuação pedagógica</p>
                  </div>
                </div>

                {proposal.soft.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Avisos pedagógicos: {proposal.soft.map((s) => `${s.count} ${SOFT_LABEL[s.code] ?? s.code}`).join(" · ")}
                  </p>
                )}

                <TabsList>
                  <TabsTrigger value="placements">
                    Proposta ({proposal.placements.length})
                  </TabsTrigger>
                  <TabsTrigger value="suggestions">
                    Sugestões inteligentes ({suggestions.length})
                  </TabsTrigger>
                  {proposal.unplaced.length > 0 && (
                    <TabsTrigger value="unplaced" className="text-destructive">
                      Por colocar ({proposal.unplaced.length})
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="placements" className="space-y-2">
                  {proposal.placements.length === 0 ? (
                    <p className="py-4 text-sm text-muted-foreground">
                      Não há aulas novas por colocar com os parâmetros actuais.
                    </p>
                  ) : (
                    <>
                      <GenericTable data={rows} columns={columns} />
                      {proposal.placements.length > 150 && (
                        <p className="text-center text-[11px] text-muted-foreground">
                          A mostrar 150 de {proposal.placements.length} aulas.
                        </p>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-2.5">
                  {suggestions.length === 0 ? (
                    <p className="py-4 text-sm text-muted-foreground">
                      Sem bloqueios críticos: todas as restrições da escola foram cumpridas sem conflitos.
                    </p>
                  ) : (
                    suggestions.map((sug) => (
                      <div key={sug.id} className={cn("space-y-1.5 rounded-xs border p-3 text-xs", PRIO_STYLE[sug.priority])}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-semibold">
                            <Badge variant={sug.priority === "alta" ? "destructive" : "outline"} className="text-[10px] uppercase">
                              {sug.priority}
                            </Badge>
                            <span>{sug.title}</span>
                          </div>
                          {sug.impact_periods > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{sug.impact_periods} tempo(s)
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{sug.description}</p>
                        {sug.type === "unblock_availability" && sug.target.teacher_id && onOpenTeacherAvailability && (
                          <div className="pt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px]"
                              onClick={() => {
                                closeModal(MODAL_ID);
                                onOpenTeacherAvailability(sug.target.teacher_id!);
                              }}
                            >
                              <Icon name="CalendarClock" className="mr-1 size-3.5" />
                              Editar disponibilidade deste professor
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>

                {proposal.unplaced.length > 0 && (
                  <TabsContent value="unplaced" className="space-y-2">
                    <Alert className="border-destructive/40">
                      <p className="mb-1 font-semibold">Aulas que ficaram por colocar:</p>
                      {proposal.unplaced.slice(0, 15).map((u, i) => (
                        <p key={i} className="text-xs text-destructive">
                          • {u.section.name} — {u.subject} ({u.teacher}): {u.remaining} tempo(s). {u.message}
                        </p>
                      ))}
                    </Alert>
                  </TabsContent>
                )}
              </Tabs>
            )}

            <SheetFooter>
              <Button type="button" variant="outline" onClick={() => closeModal(MODAL_ID)}>
                Cancelar
              </Button>
              <ButtonSubmit
                isLoading={apply.isPending}
                disabled={!proposal || proposal.placements.length === 0 || preview.isPending}
              >
                Aplicar proposta ao horário
              </ButtonSubmit>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
