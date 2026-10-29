"use client";

import { useCan } from "@/hooks/auth/use-can";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Alert, AlertTitle, AlertDescription, Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, EmptyState, FilterPopover, FormModal, FormSelect, Icon, Input, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, WeekTimetable,
  type Column, type TimetableBlock, type TimetableSlot,
  Can,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useListFilters } from "@/hooks/common/use-list-filters";
import { useGoogleReturn } from "@/hooks/school/use-google-return";
import { useTimetables } from "@/hooks/school/use-timetables";
import { TeacherGoogleCard } from "./teacher-google-card";
import { TimetableGenerator } from "./timetable-generator";
import { academicService } from "@/services/academic-service";
import { SHIFT_LABEL, WEEKDAY, type ApiChange, type ApiEntry, type ApiRoom, type ApiValidation, type Shift } from "@/services/timetables-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const CHANGE_LABEL: Record<string, string> = { troca_tempo: "Troca de tempo", troca_professor: "Troca de professor", troca_sala: "Troca de sala", anulacao: "Anulação" };
const STATUS_LABEL = { rascunho: "Rascunho", validado: "Validado", publicado: "Publicado", arquivado: "Arquivado" } as const;
const SHIFT_OF: Record<string, Shift> = {
  MORNING: "manha",
  AFTERNOON: "tarde",
  EVENING: "noite",
  DIURNO: "diurno",
  manha: "manha",
  tarde: "tarde",
  noite: "noite",
  diurno: "diurno",
};
const SHIFT_RANGE: Record<string, { startHour: number; endHour: number }> = {
  diurno: { startHour: 7, endHour: 18 },
  DIURNO: { startHour: 7, endHour: 18 },
  manha: { startHour: 7, endHour: 13 },
  MORNING: { startHour: 7, endHour: 13 },
  tarde: { startHour: 13, endHour: 18 },
  AFTERNOON: { startHour: 13, endHour: 18 },
  noite: { startHour: 17, endHour: 21 },
  EVENING: { startHour: 17, endHour: 21 },
};
const ROOM_TYPES = ["sala", "laboratorio", "informatica", "ginasio", "biblioteca", "outro"];
const DAYS = [1, 2, 3, 4, 5];

import { TimetableEntryModal } from "./timetable-entry-modal";
import { TimetableExportModal } from "./timetable-export-modal";

const withLessonNo = (slots: Array<{ position: number; start: string; end: string; kind: "aula" | "intervalo" }>): TimetableSlot[] => {
  let n = 0;
  return slots.map((s) => ({ ...s, lessonNo: s.kind === "aula" ? ++n : undefined }));
};
const toBlock = (e: ApiEntry): TimetableBlock<ApiEntry> => ({ id: e.id, weekday: e.weekday, start: e.start, end: e.end, title: e.subject.name, subtitle: e.teacher.full_name, meta: e.room?.code ?? e.location_label ?? undefined, data: e });

function BellModal() {
  const { createBell } = useTimetables();
  const [f, setF] = useState({
    shift: "manha" as Shift,
    name: "Grelha Manhã",
    from: new Date().toISOString().slice(0, 10),
    start: "07:30",
    minutes: 45,
    periods: 6,
    breakAfter: 3,
    breakMin: 15,
  });

  const onShiftChange = (s: Shift) => {
    const defaults: Record<Shift, { start: string; periods: number; breakAfter: number }> = {
      manha: { start: "07:30", periods: 6, breakAfter: 3 },
      tarde: { start: "13:00", periods: 6, breakAfter: 3 },
      diurno: { start: "07:30", periods: 10, breakAfter: 4 },
      noite: { start: "17:00", periods: 5, breakAfter: 2 },
    };
    const d = defaults[s] ?? defaults.manha;
    setF((p) => ({
      ...p,
      shift: s,
      name: `Grelha ${SHIFT_LABEL[s] ?? s}`,
      start: d.start,
      periods: d.periods,
      breakAfter: d.breakAfter,
    }));
  };

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  // o intervalo só existe depois de um tempo que exista e antes do último («intervalo após o tempo 10» com 6 tempos)
  const breakInvalid = f.breakAfter < 1 || f.breakAfter >= f.periods;
  return (
    <FormModal
      id="tt-new-bell"
      title="Nova grelha de tempos"
      description="Define os tempos de aula e o intervalo de um turno."
      submitLabel="Criar grelha"
      disabled={breakInvalid}
      isLoading={createBell.isPending}
      onSubmit={() =>
        createBell
          .mutateAsync({
            shift: f.shift,
            name: f.name,
            validFrom: f.from,
            start: f.start,
            periodMinutes: f.minutes,
            periods: f.periods,
            breakAfter: f.breakAfter,
            breakMinutes: f.breakMin,
          })
          .then(() => SucessMessage("Grelha criada."))
          .catch(fail)
      }
    >
      <FormSelect
        label="Turno"
        value={f.shift}
        onValueChange={(v) => onShiftChange(v as Shift)}
        options={(Object.keys(SHIFT_LABEL) as Shift[]).map((s) => ({ value: s, label: SHIFT_LABEL[s] }))}
      />
      <Input label="Nome" value={f.name} onChange={(e) => set("name", e.target.value)} />
      <Input label="Válida desde" type="date" value={f.from} onChange={(e) => set("from", e.target.value)} />
      <Input label="Início" type="time" value={f.start} onChange={(e) => set("start", e.target.value)} />
      <Input label="Minutos por tempo" type="quantity" min={30} max={120} step={5} value={f.minutes} onChange={(e) => set("minutes", Number(e.target.value))} />
      <Input label="N.º de tempos" type="quantity" min={1} max={12} step={1} value={f.periods} onChange={(e) => set("periods", Number(e.target.value))} />
      <Input label="Intervalo após o tempo" type="quantity" min={1} max={Math.max(1, f.periods - 1)} step={1} value={f.breakAfter} error={breakInvalid ? `A grelha só tem ${f.periods} tempos: o intervalo tem de ser depois de um tempo de 1 a ${f.periods - 1}.` : undefined} onChange={(e) => set("breakAfter", Number(e.target.value))} />
      <Input label="Duração do intervalo (min)" type="quantity" min={5} max={60} step={5} value={f.breakMin} onChange={(e) => set("breakMin", Number(e.target.value))} />
    </FormModal>
  );
}

function RoomModal() {
  const { createRoom } = useTimetables();
  const [f, setF] = useState({ code: "", name: "", type: "sala", capacity: "" });
  const set = <K extends keyof typeof f>(k: K, v: string) => setF((p) => ({ ...p, [k]: v }));
  return (
    <FormModal id="tt-new-room" title="Nova sala" submitLabel="Adicionar sala" isLoading={createRoom.isPending} disabled={!f.code.trim() || f.name.trim().length < 2} onSubmit={() => createRoom.mutateAsync({ code: f.code.trim(), name: f.name.trim(), type: f.type, capacity: f.capacity ? Number(f.capacity) : undefined }).then(() => { SucessMessage("Sala criada."); setF({ code: "", name: "", type: "sala", capacity: "" }); }).catch(fail)}>
      <Input label="Código *" placeholder="Ex: B14" value={f.code} onChange={(e) => set("code", e.target.value)} />
      <Input label="Nome *" value={f.name} onChange={(e) => set("name", e.target.value)} />
      <FormSelect label="Tipo" value={f.type} onValueChange={(v) => set("type", v)} options={ROOM_TYPES.map((t) => ({ value: t, label: t }))} />
      <Input label="Lotação" type="quantity" min={1} max={200} step={1} value={f.capacity} onChange={(e) => set("capacity", e.target.value)} />
    </FormModal>
  );
}

function ChangeModal({ entry, timetableId }: { entry: ApiEntry | null; timetableId: string }) {
  const { requestChange, rooms, roomsEnabled } = useTimetables(timetableId);
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers", "change-form"], queryFn: academicService.teachers, staleTime: 60 * 1000 });
  const [type, setType] = useState<"troca_tempo" | "troca_professor" | "troca_sala" | "anulacao">(roomsEnabled ? "troca_sala" : "troca_tempo");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [weekday, setWeekday] = useState("1");
  const [slot, setSlot] = useState("1");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("none");

  return (
    <FormModal id="tt-request-change" title="Pedir mudança ao horário" description="O horário está publicado: a mudança fica registada com efeito na data indicada." submitLabel="Registar mudança" isLoading={requestChange.isPending} disabled={reason.trim().length < 5 || (type === "troca_professor" && !teacherId)} onSubmit={() => (entry ? requestChange.mutateAsync({ type, entryId: entry.id, effectiveDate: date, reason: reason.trim(), weekday: type === "troca_tempo" ? Number(weekday) : undefined, firstSlot: type === "troca_tempo" ? Number(slot) : undefined, teacherId: type === "troca_professor" ? teacherId : undefined, roomId: type === "troca_sala" ? (roomId === "none" ? null : roomId) : undefined }).then(() => SucessMessage("Mudança registada.")).catch(fail) : undefined)}>
      <FormSelect label="Tipo de mudança" value={type} onValueChange={(v) => setType(v as typeof type)} options={Object.entries(CHANGE_LABEL).filter(([value]) => roomsEnabled || value !== "troca_sala").map(([value, label]) => ({ value, label }))} />
      <Input label="Em vigor desde" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      {type === "troca_tempo" && (<><FormSelect label="Novo dia" value={weekday} onValueChange={setWeekday} options={DAYS.map((d) => ({ value: String(d), label: WEEKDAY[d] ?? "" }))} /><Input label="Novo tempo" type="quantity" min={1} max={12} step={1} value={slot} onChange={(e) => setSlot(e.target.value)} /></>)}
      {type === "troca_professor" && <div className="sm:col-span-2"><FormSelect label="Novo professor *" value={teacherId} onValueChange={setTeacherId} options={teachers.map((t) => ({ value: t.id, label: t.full_name }))} /></div>}
      {type === "troca_sala" && <div className="sm:col-span-2"><FormSelect label="Nova sala" value={roomId} onValueChange={setRoomId} options={[{ value: "none", label: "Sem sala" }, ...rooms.map((r) => ({ value: r.id, label: `${r.code} — ${r.name}` }))]} /></div>}
      <div className="sm:col-span-2"><Input label="Motivo (mín. 5 caracteres) *" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
    </FormModal>
  );
}

/** Horários: vista semanal em calendário (por turma e por professor), versões, grelhas de tempos, salas e mudanças. */

/** Estado vazio guiado: explica o fluxo (grelha de tempos → salas → horário → aulas → validar e publicar). */
function TimetableGuide({ hasBells, hasRooms, roomsEnabled, hasYear, creating, onCreate, onBells, onRooms }: { hasBells: boolean; hasRooms: boolean; roomsEnabled: boolean; hasYear: boolean; creating: boolean; onCreate: () => void; onBells: () => void; onRooms: () => void }) {
  const allSteps = [
    { done: hasBells, title: "1. Defina os tempos de aula", text: "Duração, número de tempos e intervalo de cada turno escolar.", action: "Criar grelha de tempos", run: onBells },
    { done: hasRooms, title: "2. Registe as salas escolares", text: "Opcional, mas evita conflitos de ocupação física de turmas.", action: "Adicionar sala", run: onRooms },
    { done: false, title: "3. Crie a versão do horário", text: "Começa como rascunho; as turmas só veem o horário quando publicado.", action: "Criar horário", run: onCreate, primary: true },
    { done: false, title: "4. Preencha as aulas na grelha", text: "Clique num tempo livre da turma para atribuir disciplina, professor e sala." },
    { done: false, title: "5. Valide e publique oficialmente", text: "O sistema impede automaticamente choques de professor, turma e sala. Valide e publique para todos os utilizadores.", isFinal: true },
  ];
  // Sem o recurso «salas» (Essencial) o passo das salas não existe; a numeração vem da posição.
  const steps = allSteps.filter((s) => roomsEnabled || !s.title.includes("salas escolares"));
  return (
    <EmptyState icon="CalendarRange" title="Ainda não há horário escolar" description={hasYear ? "Siga os passos abaixo para configurar os turnos, salas e montar a grade semanal das turmas." : "Não há ano letivo ativo. Crie o ano letivo em Configurações antes de montar o horário."}>
      <ol className="mt-2 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-2">
        {steps.map((st, i) => (
          <li key={st.title} className={"flex gap-3 rounded-xs border bg-background/80 p-3.5 transition-colors " + (st.done ? "border-emerald-500/40 bg-emerald-500/[0.04]" : "border-border") + (st.isFinal ? " sm:col-span-2" : "")}>
            <span className={"flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " + (st.done ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-primary/10 text-primary")}>
              {st.done ? <Icon name="Check" className="size-4" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="text-sm font-medium">{`${i + 1}. ${st.title.replace(/^\d+\.\s*/, "")}`}</p>
                {st.done && <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Configurado</span>}
              </div>
              <p className="text-xs text-muted-foreground">{st.text}</p>
              {st.action && st.run && (
                <Can permission="timetable:write" fallback={<p className="text-[11px] text-muted-foreground">Só consulta: este passo é feito pela direção pedagógica.</p>}>
                <Button size="sm" variant={st.primary ? "default" : "outline"} className="mt-1 h-7 text-xs" disabled={!hasYear || (st.primary && creating)} onClick={st.run}>
                  {st.action}
                </Button>
                </Can>
              )}
            </div>
          </li>
        ))}
      </ol>
    </EmptyState>
  );
}

export function TimetablesPageContent() {
  useGoogleReturn();
  const [timetableId, setTimetableId] = useState<string>("");
  const tt = useTimetables(timetableId || undefined);
  const { timetables, sections, entries, slotsFor, bells, hasYear } = tt;
  const { openModal, closeModal } = useModal();
  const f = useListFilters("horario", ["turma", "professor", "disciplina", "sala"]);

  useEffect(() => {
    if (!timetableId && timetables.length > 0) setTimetableId((timetables.find((t) => t.status === "publicado") ?? timetables[0]!).id);
  }, [timetables, timetableId]);

  const current = timetables.find((t) => t.id === timetableId);
  const canWriteTimetable = useCan().can("timetable:write");
  const editable = canWriteTimetable && (current?.status === "rascunho" || current?.status === "validado");
  const [slotTarget, setSlotTarget] = useState<{
    sectionId: string;
    weekday: number;
    slot: number;
    start?: string;
    end?: string;
  } | null>(null);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [picked, setPicked] = useState<ApiEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<ApiEntry | null>(null);
  const [report, setReport] = useState<ApiValidation | null>(null);

  const section = sections.find((s) => s.id === (f.get("turma") || sections[0]?.id));
  const teachers = useMemo(() => [...new Map(entries.map((e) => [e.teacher.id, e.teacher.full_name])).entries()], [entries]);
  const teacher = f.get("professor") || teachers[0]?.[0];
  const subjects = useMemo(() => [...new Set(entries.map((e) => e.subject.name))].sort(), [entries]);
  const roomCodes = useMemo(() => [...new Set(entries.map((e) => e.room?.code).filter((c): c is string => Boolean(c)))].sort(), [entries]);
  const narrow = (list: ApiEntry[]) => list.filter((e) => (!f.get("disciplina") || e.subject.name === f.get("disciplina")) && (!f.get("sala") || e.room?.code === f.get("sala")));

  const sectionEntries = narrow(entries.filter((e) => e.section.id === section?.id));
  const teacherEntries = narrow(entries.filter((e) => e.teacher.id === teacher));
  const sectionSlots = section ? withLessonNo(slotsFor(section.shift)) : [];
  const currentShiftHours = section
    ? SHIFT_RANGE[section.shift] ?? { startHour: 7, endHour: 18 }
    : { startHour: 7, endHour: 18 };

  const roomColumns: Column<ApiRoom>[] = [
    { key: "code", header: "Código", render: (_, r) => <span className="font-mono text-xs font-semibold">{r.code}</span> },
    { key: "name", header: "Sala" },
    { key: "capacity", header: "Lotação", render: (_, r) => r.capacity ?? "—" },
    { key: "is_active", header: "Estado", render: (_, r) => (r.is_active ? <Badge variant="success">Ativa</Badge> : <Badge variant="secondary">Inactiva</Badge>) },
    { key: "action", header: "Ação", render: (_, r) => <ButtonOnlyAction data={r} actions={[{ permission: "timetable:write", label: r.is_active ? "Desativar" : "Ativar", icon: "CirclePower", onClick: (x) => void tt.setRoomActive.mutateAsync({ id: x.id, isActive: !x.is_active }).then(() => SucessMessage(x.is_active ? "Sala desativada." : "Sala ativada.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."))) }]} /> },
  ];
  const changeColumns: Column<ApiChange>[] = [
    { key: "effective_date", header: "Em vigor", render: (_, c) => <span className="font-mono text-xs">{c.effective_date}</span> },
    { key: "type", header: "Tipo", render: (_, c) => <Badge variant="outline">{CHANGE_LABEL[c.type] ?? c.type}</Badge> },
    { key: "reason", header: "Motivo" },
    { key: "created_at", header: "Pedido em", render: (_, c) => <span className="font-mono text-xs">{c.created_at.slice(0, 10)}</span> },
  ];

  const bar = (
    <div className="flex flex-wrap gap-4">
      <FilterPopover icon="Users" label="Disciplina" options={subjects.map((s) => ({ value: s, label: s }))} value={f.get("disciplina") || null} onChange={(v) => f.setFilter("disciplina", v)} />
      <FilterPopover icon="DoorOpen" label="Sala" options={roomCodes.map((s) => ({ value: s, label: s }))} value={f.get("sala") || null} onChange={(v) => f.setFilter("sala", v)} />
      {(f.get("disciplina") || f.get("sala")) && <Button size="sm" variant="outline" className="h-10 text-destructive" onClick={() => { f.setFilter("disciplina", ""); f.setFilter("sala", ""); }}><Icon name="X" className="size-4 mr-2" />Limpar</Button>}
    </div>
  );

  return (
    <div className="space-y-6">
      <TitleList title="Horários Escolares" suTitle="Gestão de horários por turma, sala e professor.">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={!current}
            onClick={() => setIsExportOpen(true)}
          >
            <Icon name="Download" className="size-4" />
            Exportar Horário (PDF)
          </Button>
          <Can permission="timetable:write"><Button size="sm" className="gap-1.5" disabled={!hasYear || tt.create.isPending} onClick={() => tt.create.mutateAsync(current?.id).then(() => SucessMessage(current ? "Nova versão criada a partir da atual." : "Horário criado.")).catch(fail)}><Icon name="Plus" className="size-4" />{current ? "Nova versão" : "Criar horário"}</Button></Can>
        </div>
      </TitleList>
<TeacherGoogleCard />

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={current ? `v${current.version_number}` : "—"} subtitle="Versão em vista" icon="CalendarRange" description={current ? STATUS_LABEL[current.status] : "Sem horário"} />
        <DynamicMetricCard title={current?.entries ?? 0} subtitle="Aulas no horário" icon="BookOpen" description="Em todas as turmas" />
        <DynamicMetricCard title={sections.length} subtitle="Turmas" icon="Users" description="Com grelha por turma" />
        <DynamicMetricCard title={teachers.length} subtitle="Professores com aulas" icon="GraduationCap" description="Neste horário" />
      </div>

      {timetables.length > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64"><FormSelect label="Versão do horário" value={timetableId} onValueChange={setTimetableId} options={timetables.map((t) => ({ value: t.id, label: `v${t.version_number} — ${STATUS_LABEL[t.status]} (${t.entries} aulas)` }))} /></div>
          {editable && (
            <>
              <Can permission="timetable:write"><TimetableGenerator timetableId={timetableId} sections={sections.map((s) => ({ id: s.id, name: s.name }))} /></Can>
              <Button size="sm" variant="outline" className="h-10" disabled={tt.validate.isPending} onClick={() => tt.validate.mutateAsync().then(setReport).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível validar.")))}>Validar</Button>
              <Can permission="timetable:publish"><Button size="sm" className="h-10" disabled={tt.publish.isPending} onClick={() => openModal("tt-publish-confirm")}>Publicar</Button></Can>
              <ConfirmModal
                id="tt-publish-confirm"
                title="Publicar horário"
                description="Torna esta versão o horário oficial da escola."
                confirmLabel="Publicar"
                isLoading={tt.publish.isPending}
                effects={[
                  "Só se publica sem violações obrigatórias (choques de professor, turma e sala, disponibilidades, grelha). Use «Validar» antes para as ver.",
                  "A versão publicada anterior passa a arquivada e esta torna-se a que professores, alunos e encarregados veem.",
                  "Depois de publicado já não se editam as aulas: as alterações fazem-se por pedidos de mudança com data de efeito (separador «Mudanças»).",
                ]}
                onConfirm={() => tt.publish.mutateAsync().then(() => SucessMessage("Horário publicado.")).catch(fail)}
              />
            </>
          )}
        </div>
      )}

      {report && (
        <Alert className={report.hard.length ? "border-destructive/40" : "border-emerald-500/40"}>
          <p className="font-semibold">{report.hard.length ? `${report.hard.length} violação(ões) obrigatória(s)` : "Sem violações obrigatórias"} • {report.soft.length} aviso(s) • pontuação {report.score}/100</p>
          <p className="text-xs text-muted-foreground">Violações obrigatórias impedem a publicação e têm de ser corrigidas. Os avisos não impedem: cada um tira pontos à pontuação (100 = sem avisos), que serve só para comparar versões.</p>
          {[...report.hard, ...report.soft].slice(0, 12).map((v, i) => <p key={i} className={v.severity === "hard" ? "text-destructive text-sm" : "text-amber-700 text-sm"}>• {v.message}</p>)}
        </Alert>
      )}

      <Tabs defaultValue="section" className="space-y-2">
        <TabsList>
          <TabsTrigger value="section">Por turma</TabsTrigger>
          <TabsTrigger value="teacher">Por professor</TabsTrigger>
          <TabsTrigger value="bells">Tempos</TabsTrigger>
          {tt.roomsEnabled && <TabsTrigger value="rooms">Salas</TabsTrigger>}
          <TabsTrigger value="changes">Mudanças</TabsTrigger>
        </TabsList>

        <TabsContent value="section" className="space-y-5">
          {!current ? (
            <TimetableGuide
              hasBells={bells.length > 0}
              hasRooms={tt.rooms.length > 0}
              roomsEnabled={tt.roomsEnabled}
              hasYear={hasYear}
              creating={tt.create.isPending}
              onCreate={() => tt.create.mutateAsync(undefined).then(() => SucessMessage("Horário criado.")).catch(fail)}
              onBells={() => openModal("tt-new-bell")}
              onRooms={() => openModal("tt-new-room")}
            />
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="w-72">
                    <FormSelect
                      label="Turma"
                      value={section?.id ?? ""}
                      onValueChange={(v) => f.setFilter("turma", v)}
                      options={sections.map((s) => ({ value: s.id, label: `${s.classLevel} ${s.name} (${SHIFT_LABEL[SHIFT_OF[s.shift] ?? "manha"]})` }))}
                    />
                  </div>
                  {bar}
                </div>

                {editable && section && (
                  <Button
                    size="sm"
                    className="gap-2 shrink-0 h-10"
                    onClick={() => {
                      setEntryToEdit(null);
                      const firstAula = sectionSlots.find((s) => s.kind === "aula");
                      setSlotTarget({
                        sectionId: section.id,
                        weekday: 1,
                        slot: firstAula?.position ?? 1,
                        start: firstAula?.start ?? "07:30",
                        end: firstAula?.end ?? "08:15",
                      });
                      setIsAddEntryOpen(true);
                    }}
                  >
                    <Icon name="Plus" className="size-4" />
                    Adicionar Aula
                  </Button>
                )}
              </div>

              {section && sectionSlots.length === 0 && (
                <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                  <Icon name="Clock" className="size-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle>Sem grelha de tempos para o turno desta turma</AlertTitle>
                  <AlertDescription className="text-amber-800/90 dark:text-amber-300/90 flex flex-wrap items-center justify-between gap-3 mt-1">
                    <span>O turno <strong>{SHIFT_LABEL[SHIFT_OF[section.shift] ?? "manha"]}</strong> ainda não possui tempos de aula configurados.</span>
                    <Can permission="timetable:write"><Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-amber-500/40 bg-background hover:bg-amber-500/15"
                      onClick={() => openModal("tt-new-bell")}
                    >
                      <Icon name="Plus" className="size-3.5 mr-1" />
                      Criar grelha para {SHIFT_LABEL[SHIFT_OF[section.shift] ?? "manha"]}
                    </Button></Can>
                  </AlertDescription>
                </Alert>
              )}

              <WeekTimetable<ApiEntry>
                blocks={sectionEntries.map(toBlock)}
                slots={sectionSlots}
                startHour={currentShiftHours.startHour}
                endHour={currentShiftHours.endHour}
                onBlockClick={(b) => { setPicked(b.data!); openModal("tt-entry"); }}
                onEmptyClick={editable && section ? (weekday, s) => {
                  setEntryToEdit(null);
                  setSlotTarget({
                    sectionId: section.id,
                    weekday,
                    slot: s.position,
                    start: s.start,
                    end: s.end,
                  });
                  setIsAddEntryOpen(true);
                } : undefined}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="teacher" className="space-y-5">
          {!current ? (
            <EmptyState
              icon="CalendarRange"
              title="Horário escolar ainda não criado"
              description="Para consultar a grade semanal por professor, crie primeiro a versão do horário no separador «Por turma»."
            />
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-end gap-4">
                <div className="w-72"><FormSelect label="Professor" value={teacher ?? ""} onValueChange={(v) => f.setFilter("professor", v)} options={teachers.map(([id, name]) => ({ value: id, label: name }))} /></div>
                {bar}
              </div>
              {teachers.length === 0 ? (
                <EmptyState
                  icon="GraduationCap"
                  title="Sem aulas por professor"
                  description="Quando houver aulas atribuídas no horário, a grade semanal de cada professor aparece aqui."
                />
              ) : (
                <WeekTimetable<ApiEntry>
                  blocks={teacherEntries.map((e) => ({ ...toBlock(e), subtitle: `${e.section.name}` }))}
                  startHour={7}
                  endHour={18}
                  onBlockClick={(b) => { setPicked(b.data!); openModal("tt-entry"); }}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="bells" className="space-y-4">
          <Can permission="timetable:write"><div className="mt-6"><Button size="sm" variant="outline" className="gap-1.5" onClick={() => openModal("tt-new-bell")}><Icon name="Plus" className="size-4" />Nova grelha</Button></div></Can>
          {bells.length === 0 && <EmptyState icon="Clock" title="Sem grelhas de tempos" description="A grelha define a duração dos tempos de aula e o intervalo de cada turno. É necessária para montar o horário."><Can permission="timetable:write" fallback={<p className="text-xs text-muted-foreground">A grelha é definida pela Direção Pedagógica.</p>}><Button size="sm" className="gap-1.5" onClick={() => openModal("tt-new-bell")}><Icon name="Plus" className="size-4" />Criar grelha de tempos</Button></Can></EmptyState>}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {bells.map((b) => (
              <DynamicMetricCard key={b.id} title={SHIFT_LABEL[b.shift]} subtitle={`${b.name} · desde ${b.valid_from}`} icon="Clock" description={b.slots.map((s) => `${s.start}–${s.end}${s.kind === "intervalo" ? " (intervalo)" : ""}`).join(" • ")} />
            ))}
            
          </div>
        </TabsContent>

        {tt.roomsEnabled && <TabsContent value="rooms">
          <div className="mt-6 flex justify-end"><Can permission="timetable:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("tt-new-room")}><Icon name="Plus" className="size-4" />Nova sala</Button></Can></div>
          <DataList<ApiRoom>
            prefix="salas"
            rows={tt.rooms}
            columns={roomColumns}
            searchPlaceholder="Pesquisar sala"
            searchText={(r) => `${r.code} ${r.name}`}
            filters={[{ key: "estado", label: "Estado", icon: "Tag", options: [{ value: "activa", label: "Ativa" }, { value: "inactiva", label: "Inactiva" }], match: (r, v) => (v === "activa" ? r.is_active : !r.is_active) }]}
            sorts={[{ value: "codigo", label: "Código", compare: (a, b) => a.code.localeCompare(b.code) }, { value: "lotacao", label: "Lotação", compare: (a, b) => (a.capacity ?? 0) - (b.capacity ?? 0) }]}
            emptyTitle="Sem salas registadas"
            emptyIcon="DoorOpen"
          />
        </TabsContent>}

        <TabsContent value="changes">
          <DataList<ApiChange>
            prefix="mudancas"
            rows={tt.changes}
            columns={changeColumns}
            searchPlaceholder="Pesquisar por motivo"
            searchText={(c) => c.reason}
            filters={[{ key: "tipo", label: "Tipo", icon: "Tag", options: Object.entries(CHANGE_LABEL).map(([value, label]) => ({ value, label })), match: (c, v) => c.type === v }]}
            dateFilters={[{ key: "vigor", label: "Em vigor", getDate: (c) => c.effective_date }]}
            sorts={[{ value: "data", label: "Data de efeito", compare: (a, b) => a.effective_date.localeCompare(b.effective_date) }]}
            emptyTitle="Sem mudanças pedidas"
            emptyDescription="As mudanças a um horário publicado aparecem aqui."
            emptyIcon="History"
          />
        </TabsContent>
      </Tabs>

      {current && (
        <TimetableEntryModal
          isOpen={isAddEntryOpen}
          onClose={() => {
            setIsAddEntryOpen(false);
            setSlotTarget(null);
            setEntryToEdit(null);
          }}
          timetableId={current.id}
          entryToEdit={entryToEdit}
          defaultSectionId={slotTarget?.sectionId || section?.id}
          defaultWeekday={slotTarget?.weekday ?? 1}
          defaultSlot={slotTarget?.slot ?? 1}
          defaultStart={slotTarget?.start}
          defaultEnd={slotTarget?.end}
          sections={sections}
          subjects={tt.subjects}
          teachers={tt.teachers}
          rooms={tt.rooms}
          assignments={tt.assignments}
          existingEntries={tt.entries}
        />
      )}
      {current && (
        <TimetableExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          sections={sections}
          activeSectionId={section?.id}
          entries={tt.entries}
          slots={sectionSlots}
          academicYear={section?.academicYear}
        />
      )}
      {current && <ChangeModal entry={picked} timetableId={current.id} />}
      <BellModal />
      <RoomModal />

      <FormModal id="tt-entry" title={picked?.subject.name ?? "Aula"} description={picked ? `${picked.section.name} • ${picked.teacher.full_name}` : undefined} readOnly onSubmit={() => undefined}>
        {picked && (
          <div className="sm:col-span-2 space-y-3 text-sm">
            <p className="text-muted-foreground">{WEEKDAY[picked.weekday]} {picked.start}–{picked.end}{picked.room ? ` • sala ${picked.room.code}` : ""}</p>
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {editable && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      setEntryToEdit(picked);
                      closeModal("tt-entry");
                      setIsAddEntryOpen(true);
                    }}
                  >
                    <Icon name="Pencil" className="size-4" />
                    Editar aula
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={tt.removeEntry.isPending}
                    onClick={() =>
                      tt.removeEntry
                        .mutateAsync(picked.id)
                        .then(() => {
                          SucessMessage("Aula removida.");
                          setPicked(null);
                          closeModal("tt-entry");
                        })
                        .catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))
                    }
                  >
                    Remover do horário
                  </Button>
                </>
              )}
              {!editable && current && <Button size="sm" variant="outline" onClick={() => openModal("tt-request-change")}>Pedir mudança</Button>}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
