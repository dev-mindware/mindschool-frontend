"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Alert, Badge, Button, ButtonOnlyAction, DataList, EmptyState, FilterPopover, FormModal, FormSelect, Icon, Input, Tabs, TabsContent, TabsList, TabsTrigger, TitleList, WeekTimetable,
  type Column, type TimetableBlock, type TimetableSlot,
  Can,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useListFilters } from "@/hooks/common/use-list-filters";
import { useGoogleReturn } from "@/hooks/school/use-google-return";
import { useTimetables } from "@/hooks/school/use-timetables";
import { TeacherGoogleCard } from "./teacher-google-card";
import { academicService } from "@/services/academic-service";
import { SHIFT_LABEL, WEEKDAY, type ApiChange, type ApiEntry, type ApiRoom, type ApiValidation, type Shift } from "@/services/timetables-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const CHANGE_LABEL: Record<string, string> = { troca_tempo: "Troca de tempo", troca_professor: "Troca de professor", troca_sala: "Troca de sala", anulacao: "Anulação" };
const STATUS_LABEL = { rascunho: "Rascunho", validado: "Validado", publicado: "Publicado", arquivado: "Arquivado" } as const;
const SHIFT_OF: Record<string, Shift> = { MORNING: "manha", AFTERNOON: "tarde", EVENING: "noite" };
const ROOM_TYPES = ["sala", "laboratorio", "informatica", "ginasio", "biblioteca", "outro"];
const DAYS = [1, 2, 3, 4, 5];

const withLessonNo = (slots: Array<{ position: number; start: string; end: string; kind: "aula" | "intervalo" }>): TimetableSlot[] => {
  let n = 0;
  return slots.map((s) => ({ ...s, lessonNo: s.kind === "aula" ? ++n : undefined }));
};
const toBlock = (e: ApiEntry): TimetableBlock<ApiEntry> => ({ id: e.id, weekday: e.weekday, start: e.start, end: e.end, title: e.subject.name, subtitle: e.teacher.full_name, meta: e.room?.code ?? e.location_label ?? undefined, data: e });

function SlotModal({ target, timetableId }: { target: { sectionId: string; weekday: number; slot: number } | null; timetableId: string }) {
  const { assignments, rooms, addEntry } = useTimetables(timetableId);
  const [assignmentId, setAssignmentId] = useState("");
  const [span, setSpan] = useState("1");
  const [roomId, setRoomId] = useState("");
  const options = assignments.filter((a) => a.sectionId === target?.sectionId);

  return (
    <FormModal id="tt-add-entry" title={target ? `${WEEKDAY[target.weekday]}, ${target.slot}.º tempo` : "Adicionar aula"} description="Choques de professor, turma e sala são recusados pela API." submitLabel="Adicionar" isLoading={addEntry.isPending} disabled={!assignmentId} onSubmit={() => (target ? addEntry.mutateAsync({ sectionSubjectId: assignmentId, weekday: target.weekday, firstSlot: target.slot, span: Number(span), roomId: roomId || undefined }).then(() => { SucessMessage("Aula adicionada."); setAssignmentId(""); }).catch(fail) : undefined)}>
      <div className="sm:col-span-2"><FormSelect label="Disciplina e professor *" value={assignmentId} onValueChange={setAssignmentId} options={options.map((a) => ({ value: a.id, label: `${a.subjectName} — ${a.teacherName}` }))} /></div>
      <FormSelect label="Duração" value={span} onValueChange={setSpan} options={[{ value: "1", label: "1 tempo" }, { value: "2", label: "2 tempos (duplo)" }]} />
      <FormSelect label="Sala" value={roomId || "none"} onValueChange={(v) => setRoomId(v === "none" ? "" : v)} options={[{ value: "none", label: "Sem sala" }, ...rooms.filter((r) => r.is_active).map((r) => ({ value: r.id, label: `${r.code} — ${r.name}` }))]} />
    </FormModal>
  );
}

function BellModal() {
  const { createBell } = useTimetables();
  const [f, setF] = useState({ shift: "manha" as Shift, name: "Grelha", from: new Date().toISOString().slice(0, 10), start: "07:30", minutes: 45, periods: 6, breakAfter: 3, breakMin: 15 });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  return (
    <FormModal id="tt-new-bell" title="Nova grelha de tempos" description="Define os tempos de aula e o intervalo de um turno." submitLabel="Criar grelha" isLoading={createBell.isPending} onSubmit={() => createBell.mutateAsync({ shift: f.shift, name: f.name, validFrom: f.from, start: f.start, periodMinutes: f.minutes, periods: f.periods, breakAfter: f.breakAfter, breakMinutes: f.breakMin }).then(() => SucessMessage("Grelha criada.")).catch(fail)}>
      <FormSelect label="Turno" value={f.shift} onValueChange={(v) => set("shift", v as Shift)} options={(Object.keys(SHIFT_LABEL) as Shift[]).map((s) => ({ value: s, label: SHIFT_LABEL[s] }))} />
      <Input label="Nome" value={f.name} onChange={(e) => set("name", e.target.value)} />
      <Input label="Válida desde" type="date" value={f.from} onChange={(e) => set("from", e.target.value)} />
      <Input label="Início" type="time" value={f.start} onChange={(e) => set("start", e.target.value)} />
      <Input label="Minutos por tempo" type="number" value={f.minutes} onChange={(e) => set("minutes", Number(e.target.value))} />
      <Input label="N.º de tempos" type="number" value={f.periods} onChange={(e) => set("periods", Number(e.target.value))} />
      <Input label="Intervalo após o tempo" type="number" value={f.breakAfter} onChange={(e) => set("breakAfter", Number(e.target.value))} />
      <Input label="Duração do intervalo (min)" type="number" value={f.breakMin} onChange={(e) => set("breakMin", Number(e.target.value))} />
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
      <Input label="Lotação" type="number" value={f.capacity} onChange={(e) => set("capacity", e.target.value)} />
    </FormModal>
  );
}

function ChangeModal({ entry, timetableId }: { entry: ApiEntry | null; timetableId: string }) {
  const { requestChange, rooms } = useTimetables(timetableId);
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers", "change-form"], queryFn: academicService.teachers, staleTime: 60 * 1000 });
  const [type, setType] = useState<"troca_tempo" | "troca_professor" | "troca_sala" | "anulacao">("troca_sala");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [weekday, setWeekday] = useState("1");
  const [slot, setSlot] = useState("1");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("none");

  return (
    <FormModal id="tt-request-change" title="Pedir mudança ao horário" description="O horário está publicado: a mudança fica registada com efeito na data indicada." submitLabel="Registar mudança" isLoading={requestChange.isPending} disabled={reason.trim().length < 5 || (type === "troca_professor" && !teacherId)} onSubmit={() => (entry ? requestChange.mutateAsync({ type, entryId: entry.id, effectiveDate: date, reason: reason.trim(), weekday: type === "troca_tempo" ? Number(weekday) : undefined, firstSlot: type === "troca_tempo" ? Number(slot) : undefined, teacherId: type === "troca_professor" ? teacherId : undefined, roomId: type === "troca_sala" ? (roomId === "none" ? null : roomId) : undefined }).then(() => SucessMessage("Mudança registada.")).catch(fail) : undefined)}>
      <FormSelect label="Tipo de mudança" value={type} onValueChange={(v) => setType(v as typeof type)} options={Object.entries(CHANGE_LABEL).map(([value, label]) => ({ value, label }))} />
      <Input label="Em vigor desde" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      {type === "troca_tempo" && (<><FormSelect label="Novo dia" value={weekday} onValueChange={setWeekday} options={DAYS.map((d) => ({ value: String(d), label: WEEKDAY[d] ?? "" }))} /><Input label="Novo tempo" type="number" value={slot} onChange={(e) => setSlot(e.target.value)} /></>)}
      {type === "troca_professor" && <div className="sm:col-span-2"><FormSelect label="Novo professor *" value={teacherId} onValueChange={setTeacherId} options={teachers.map((t) => ({ value: t.id, label: t.full_name }))} /></div>}
      {type === "troca_sala" && <div className="sm:col-span-2"><FormSelect label="Nova sala" value={roomId} onValueChange={setRoomId} options={[{ value: "none", label: "Sem sala" }, ...rooms.map((r) => ({ value: r.id, label: `${r.code} — ${r.name}` }))]} /></div>}
      <div className="sm:col-span-2"><Input label="Motivo (mín. 5 caracteres) *" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
    </FormModal>
  );
}

/** Horários: vista semanal em calendário (por turma e por professor), versões, grelhas de tempos, salas e mudanças. */

/** Estado vazio guiado: explica o fluxo (grelha de tempos → salas → horário → aulas → validar e publicar). */
function TimetableGuide({ hasBells, hasRooms, hasYear, creating, onCreate, onBells, onRooms }: { hasBells: boolean; hasRooms: boolean; hasYear: boolean; creating: boolean; onCreate: () => void; onBells: () => void; onRooms: () => void }) {
  const steps = [
    { done: hasBells, title: "Defina os tempos de aula", text: "Duração, número de tempos e intervalo de cada turno.", action: "Criar grelha de tempos", run: onBells },
    { done: hasRooms, title: "Registe as salas", text: "Opcional, mas evita choques de ocupação.", action: "Adicionar sala", run: onRooms },
    { done: false, title: "Crie o horário", text: "Começa como rascunho; só é visível depois de publicado.", action: "Criar horário", run: onCreate, primary: true },
    { done: false, title: "Preencha as aulas", text: "Clique num tempo livre da turma para atribuir disciplina, professor e sala.", },
    { done: false, title: "Valide e publique", text: "A API impede choques de professor, turma e sala antes de publicar.", },
  ];
  return (
    <EmptyState icon="CalendarRange" title="Ainda não há horário escolar" description={hasYear ? "Siga os passos abaixo para montar a grade semanal das turmas e dos professores." : "Não há ano lectivo activo. Crie o ano lectivo em Configurações antes de montar o horário."}>
      <ol className="mt-1 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-2">
        {steps.map((st, i) => (
          <li key={st.title} className={"flex gap-3 rounded-lg border bg-background p-3 " + (st.done ? "border-emerald-500/40" : "")}>
            <span className={"flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold " + (st.done ? "bg-emerald-500/15 text-emerald-700" : "bg-primary/10 text-primary")}>{st.done ? <Icon name="Check" className="size-4" /> : i + 1}</span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">{st.title}</p>
              <p className="text-xs text-muted-foreground">{st.text}</p>
              {st.action && st.run && <Button size="sm" variant={st.primary ? "default" : "outline"} className="mt-1 h-7 text-xs" disabled={!hasYear || (st.primary && creating)} onClick={st.run}>{st.action}</Button>}
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
  const { openModal } = useModal();
  const f = useListFilters("horario", ["turma", "professor", "disciplina", "sala"]);

  useEffect(() => {
    if (!timetableId && timetables.length > 0) setTimetableId((timetables.find((t) => t.status === "publicado") ?? timetables[0]!).id);
  }, [timetables, timetableId]);

  const current = timetables.find((t) => t.id === timetableId);
  const editable = current?.status === "rascunho" || current?.status === "validado";
  const [slotTarget, setSlotTarget] = useState<{ sectionId: string; weekday: number; slot: number } | null>(null);
  const [picked, setPicked] = useState<ApiEntry | null>(null);
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

  const roomColumns: Column<ApiRoom>[] = [
    { key: "code", header: "Código", render: (_, r) => <span className="font-mono text-xs font-semibold">{r.code}</span> },
    { key: "name", header: "Sala" },
    { key: "capacity", header: "Lotação", render: (_, r) => r.capacity ?? "—" },
    { key: "is_active", header: "Estado", render: (_, r) => (r.is_active ? <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">Activa</Badge> : <Badge variant="secondary">Inactiva</Badge>) },
    { key: "action", header: "Acção", render: (_, r) => <ButtonOnlyAction data={r} actions={[{ permission: "timetable:write", label: r.is_active ? "Desactivar" : "Activar", icon: "CirclePower", onClick: (x) => void tt.setRoomActive.mutateAsync({ id: x.id, isActive: !x.is_active }).then(() => SucessMessage(x.is_active ? "Sala desactivada." : "Sala activada.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."))) }]} /> },
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
      <TitleList title="Horários Escolares" suTitle="Versões do horário (rascunho → validado → publicado), vista semanal por turma e por professor; choques são impedidos pela API.">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.print()}><Icon name="Printer" className="size-4" />Imprimir</Button>
          <Can permission="timetable:write"><Button size="sm" className="gap-1.5" disabled={!hasYear || tt.create.isPending} onClick={() => tt.create.mutateAsync(current?.id).then(() => SucessMessage(current ? "Nova versão criada a partir da actual." : "Horário criado.")).catch(fail)}><Icon name="Plus" className="size-4" />{current ? "Nova versão" : "Criar horário"}</Button></Can>
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
              <Button size="sm" variant="outline" className="h-10" disabled={tt.validate.isPending} onClick={() => tt.validate.mutateAsync().then(setReport).catch((e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível validar.")))}>Validar</Button>
              <Can permission="timetable:publish"><Button size="sm" className="h-10" disabled={tt.publish.isPending} onClick={() => tt.publish.mutateAsync().then(() => SucessMessage("Horário publicado.")).catch(fail)}>Publicar</Button></Can>
            </>
          )}
        </div>
      )}

      {report && (
        <Alert className={report.hard.length ? "border-destructive/40" : "border-emerald-500/40"}>
          <p className="font-semibold">{report.hard.length ? `${report.hard.length} violação(ões) obrigatória(s)` : "Sem violações obrigatórias"} • {report.soft.length} aviso(s) • pontuação {report.score}</p>
          {[...report.hard, ...report.soft].slice(0, 12).map((v, i) => <p key={i} className={v.severity === "hard" ? "text-destructive text-sm" : "text-amber-700 text-sm"}>• {v.message}</p>)}
        </Alert>
      )}

      <Tabs defaultValue="section" className="space-y-2">
        <TabsList>
          <TabsTrigger value="section">Por turma</TabsTrigger>
          <TabsTrigger value="teacher">Por professor</TabsTrigger>
          <TabsTrigger value="bells">Tempos</TabsTrigger>
          <TabsTrigger value="rooms">Salas</TabsTrigger>
          <TabsTrigger value="changes">Mudanças</TabsTrigger>
        </TabsList>

        <TabsContent value="section" className="space-y-5">
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="w-72"><FormSelect label="Turma" value={section?.id ?? ""} onValueChange={(v) => f.setFilter("turma", v)} options={sections.map((s) => ({ value: s.id, label: `${s.classLevel} ${s.name} (${SHIFT_LABEL[SHIFT_OF[s.shift] ?? "manha"]})` }))} /></div>
            {bar}
          </div>
          {section && sectionSlots.length === 0 && <Alert><p className="text-sm">Não há grelha de tempos para o turno desta turma. Crie-a no separador «Tempos».</p></Alert>}
          {!current ? <TimetableGuide hasBells={bells.length > 0} hasRooms={tt.rooms.length > 0} hasYear={hasYear} creating={tt.create.isPending} onCreate={() => tt.create.mutateAsync(undefined).then(() => SucessMessage("Horário criado.")).catch(fail)} onBells={() => openModal("tt-new-bell")} onRooms={() => openModal("tt-new-room")} /> : (
            <WeekTimetable<ApiEntry>
              blocks={sectionEntries.map(toBlock)}
              slots={sectionSlots}
              onBlockClick={(b) => { setPicked(b.data!); openModal("tt-entry"); }}
              onEmptyClick={editable && section ? (weekday, s) => { setSlotTarget({ sectionId: section.id, weekday, slot: s.lessonNo ?? 1 }); openModal("tt-add-entry"); } : undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="teacher" className="space-y-5">
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="w-72"><FormSelect label="Professor" value={teacher ?? ""} onValueChange={(v) => f.setFilter("professor", v)} options={teachers.map(([id, name]) => ({ value: id, label: name }))} /></div>
            {bar}
          </div>
          {teachers.length === 0 ? <EmptyState icon="GraduationCap" title="Sem aulas por professor" description="Quando houver aulas atribuídas no horário, a grade semanal de cada professor aparece aqui." /> : <WeekTimetable<ApiEntry> blocks={teacherEntries.map((e) => ({ ...toBlock(e), subtitle: `${e.section.name}` }))} onBlockClick={(b) => { setPicked(b.data!); openModal("tt-entry"); }} />}
        </TabsContent>

        <TabsContent value="bells" className="space-y-4">
          <div className="mt-6"><Button size="sm" variant="outline" className="gap-1.5" onClick={() => openModal("tt-new-bell")}><Icon name="Plus" className="size-4" />Nova grelha</Button></div>
          {bells.length === 0 && <EmptyState icon="Clock" title="Sem grelhas de tempos" description="A grelha define a duração dos tempos de aula e o intervalo de cada turno. É necessária para montar o horário."><Button size="sm" className="gap-1.5" onClick={() => openModal("tt-new-bell")}><Icon name="Plus" className="size-4" />Criar grelha de tempos</Button></EmptyState>}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {bells.map((b) => (
              <DynamicMetricCard key={b.id} title={SHIFT_LABEL[b.shift]} subtitle={`${b.name} · desde ${b.valid_from}`} icon="Clock" description={b.slots.map((s) => `${s.start}–${s.end}${s.kind === "intervalo" ? " (intervalo)" : ""}`).join(" • ")} />
            ))}
            
          </div>
        </TabsContent>

        <TabsContent value="rooms">
          <div className="mt-6 flex justify-end"><Can permission="timetable:write"><Button size="sm" className="gap-1.5" onClick={() => openModal("tt-new-room")}><Icon name="Plus" className="size-4" />Nova sala</Button></Can></div>
          <DataList<ApiRoom>
            prefix="salas"
            rows={tt.rooms}
            columns={roomColumns}
            searchPlaceholder="Pesquisar sala"
            searchText={(r) => `${r.code} ${r.name}`}
            filters={[{ key: "estado", label: "Estado", icon: "Tag", options: [{ value: "activa", label: "Activa" }, { value: "inactiva", label: "Inactiva" }], match: (r, v) => (v === "activa" ? r.is_active : !r.is_active) }]}
            sorts={[{ value: "codigo", label: "Código", compare: (a, b) => a.code.localeCompare(b.code) }, { value: "lotacao", label: "Lotação", compare: (a, b) => (a.capacity ?? 0) - (b.capacity ?? 0) }]}
            emptyTitle="Sem salas registadas"
            emptyIcon="DoorOpen"
          />
        </TabsContent>

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

      {current && <SlotModal target={slotTarget} timetableId={current.id} />}
      {current && <ChangeModal entry={picked} timetableId={current.id} />}
      <BellModal />
      <RoomModal />

      <FormModal id="tt-entry" title={picked?.subject.name ?? "Aula"} description={picked ? `${picked.section.name} • ${picked.teacher.full_name}` : undefined} readOnly onSubmit={() => undefined}>
        {picked && (
          <div className="sm:col-span-2 space-y-3 text-sm">
            <p className="text-muted-foreground">{WEEKDAY[picked.weekday]} {picked.start}–{picked.end}{picked.room ? ` • sala ${picked.room.code}` : ""}</p>
            <div className="flex flex-wrap gap-2 border-t pt-3">
              {editable && <Button size="sm" variant="destructive" disabled={tt.removeEntry.isPending} onClick={() => tt.removeEntry.mutateAsync(picked.id).then(() => { SucessMessage("Aula removida."); setPicked(null); }).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")))}>Remover do horário</Button>}
              {!editable && current && <Button size="sm" variant="outline" onClick={() => openModal("tt-request-change")}>Pedir mudança</Button>}
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
