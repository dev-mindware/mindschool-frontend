"use client";

import { useCan } from "@/hooks/auth/use-can";
import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, DataList, Icon, Input, type Column } from "@/components";
import { useRollCall } from "@/hooks/school/use-roll-call";
import { AttendanceStatus } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";

interface RollCallSheetProps {
  classId: string;
  sectionSubjectId: string;
  className: string;
  subjectName: string;
  date: string;
  timeSlotLabel?: string;
}

const STATUS_BUTTONS: Array<{ status: AttendanceStatus; label: string; title: string; icon: "Check" | "X" | "FileText" | "Clock"; on: string }> = [
  { status: "PRESENT", label: "P", title: "Presente", icon: "Check", on: "bg-emerald-600 text-white border-emerald-700 ring-1 ring-emerald-500" },
  { status: "ABSENT_UNJUSTIFIED", label: "FI", title: "Falta injustificada", icon: "X", on: "bg-rose-600 text-white border-rose-700 ring-1 ring-rose-500" },
  { status: "ABSENT_JUSTIFIED", label: "FJ", title: "Falta justificada (atestado)", icon: "FileText", on: "bg-blue-600 text-white border-blue-700 ring-1 ring-blue-500" },
  { status: "LATE", label: "A", title: "Atraso", icon: "Clock", on: "bg-amber-600 text-white border-amber-700 ring-1 ring-amber-500" },
];
const STATUS_LABEL: Record<string, string> = { PRESENT: "Presente", ABSENT_UNJUSTIFIED: "Falta injustificada", ABSENT_JUSTIFIED: "Falta justificada", LATE: "Atraso" };

/** Folha de chamada: marcação rápida por aluno (gravada de imediato com optimistic update) com filtros por estado e género. */
export function RollCallSheet({ classId, sectionSubjectId, className, subjectName, date, timeSlotLabel }: RollCallSheetProps) {
  const { students, save, isLoading } = useRollCall(classId, sectionSubjectId, date);
  // a Direção Geral consulta a chamada mas não a marca (a API recusa com 403): os botões ficam desativados e explica-se porquê
  const canWrite = useCan().can("attendance:write");
  const [notes, setNotes] = useState<Record<string, string>>({});
  type Row = (typeof students)[number];

  // Limpa as anotações locais quando a turma, disciplina ou data mudam (evita vazamento entre dias/aulas)
  useEffect(() => {
    setNotes({});
  }, [classId, sectionSubjectId, date]);

  const statusOf = (id: string): AttendanceStatus | undefined => students.find((r) => r.id === id)?.status;
  const notesOf = (id: string) => {
    if (notes[id] !== undefined) return notes[id];
    return students.find((r) => r.id === id)?.notes ?? "";
  };

  const persist = (records: Array<{ enrollmentId: string; status: AttendanceStatus; notes?: string }>, ok?: string) =>
    save.mutate(records, { onSuccess: () => ok && SucessMessage(ok), onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a chamada.")) });

  const count = (s: AttendanceStatus) => students.filter((x) => x.status === s).length;
  const unmarkedCount = students.filter((x) => !x.status).length;

  const curStatus = (id: string) => statusOf(id);

  const columns: Column<Row>[] = [
    { key: "number", header: "Nº", render: (_, s) => <span className="font-mono text-xs text-muted-foreground">{s.number}</span> },
    { key: "name", header: "Estudante", render: (_, s) => <span className="font-medium">{s.name}</span> },
    { key: "gender", header: "Género", render: (_, s) => <Badge variant="outline" className="font-normal">{s.gender === "M" ? "Masc" : "Fem"}</Badge> },
    {
      key: "status", header: "Marcação",
      render: (_, s) => {
        const cur = statusOf(s.id);
        return (
          <div className="flex items-center gap-1.5">
            {STATUS_BUTTONS.map((b) => {
              const active = cur === b.status;
              return (
                <button
                  key={b.status}
                  type="button"
                  disabled={!canWrite}
                  title={b.title}
                  onClick={() => persist([{ enrollmentId: s.id, status: b.status, notes: notesOf(s.id) }])}
                  className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                    active ? b.on : "border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon name={b.icon} className="size-3" />
                  {b.label}
                </button>
              );
            })}
            {!cur && (
              <span className="text-[10px] text-muted-foreground/70 italic ml-1">Pendente</span>
            )}
          </div>
        );
      },
    },
    {
      key: "notes",
      header: "Observações",
      render: (_, s) => (
        <Input
          label=""
          value={notesOf(s.id)}
          onChange={(e) => setNotes((p) => ({ ...p, [s.id]: e.target.value }))}
          onBlur={() => {
            const currentNote = notes[s.id];
            if (currentNote !== undefined) {
              const currentStatus = curStatus(s.id) || "PRESENT";
              persist([{ enrollmentId: s.id, status: currentStatus, notes: currentNote }]);
            }
          }}
          placeholder="Adicionar nota..."
          className="h-8 min-w-48 text-xs"
        />
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-base">{className} • {subjectName}</p>
            {timeSlotLabel && (
              <Badge variant="outline" className="font-mono text-xs font-semibold bg-primary/10 text-primary border-primary/30">
                <Icon name="Clock" className="size-3 mr-1" />
                {timeSlotLabel}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(`${date}T00:00:00`).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • {isLoading ? "a carregar…" : `${students.length} alunos`}
          </p>
        </div>
        <Button size="sm" variant="outline" disabled={!canWrite || students.length === 0} title={canWrite ? undefined : "A chamada é registada pelo professor ou pela direção pedagógica."} className="gap-1.5 text-emerald-600 hover:text-emerald-700" onClick={() => persist(students.map((s) => ({ enrollmentId: s.id, status: "PRESENT" as AttendanceStatus, notes: notesOf(s.id) })), "Todos os alunos foram marcados como presentes.")}><Icon name="CheckCheck" className="size-4" />Marcar todos presentes</Button>
      </div>

      {!canWrite && <p role="note" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs">Só consulta: a chamada é registada pelo professor ou pela direção pedagógica.</p>}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-muted/40 p-3 rounded-lg border border-border/40">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Presentes: <strong className="text-foreground">{count("PRESENT")}</strong></span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" /> Faltas injustificadas: <strong className="text-rose-600 font-semibold">{count("ABSENT_UNJUSTIFIED")}</strong></span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-500" /> Faltas justificadas: <strong className="text-blue-600 font-semibold">{count("ABSENT_JUSTIFIED")}</strong></span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> Atrasos: <strong className="text-amber-600 font-semibold">{count("LATE")}</strong></span>
        {unmarkedCount > 0 ? (
          <span className="flex items-center gap-1.5 sm:ml-auto text-amber-500 font-medium"><Icon name="Clock" className="size-3.5" /> Pendentes de chamada: <strong>{unmarkedCount}</strong></span>
        ) : (
          <span className="flex items-center gap-1.5 sm:ml-auto text-emerald-600 font-medium"><Icon name="CheckCircle2" className="size-3.5" /> Chamada concluída ({students.length})</span>
        )}
      </div>

      <DataList<Row>
        prefix="chamada"
        rows={students}
        columns={columns}
        isLoading={isLoading}
        pageSize={25}
        searchPlaceholder="Pesquisar aluno"
        searchText={(s) => `${s.name} ${s.number}`}
        filters={[
          {
            key: "estado",
            label: "Marcação",
            icon: "Tag",
            options: [
              { value: "PENDING", label: "Pendente (por chamar)" },
              ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
            ],
            match: (s, v) => (v === "PENDING" ? !s.status : s.status === v),
          },
          { key: "genero", label: "Género", icon: "Users", options: [{ value: "M", label: "Masculino" }, { value: "F", label: "Feminino" }], match: (s, v) => s.gender === v },
        ]}
        sorts={[{ value: "numero", label: "N.º", compare: (a, b) => Number(a.number) - Number(b.number) }, { value: "nome", label: "Nome", compare: (a, b) => a.name.localeCompare(b.name) }]}
        emptyTitle="Sem alunos nesta turma"
        emptyIcon="Users"
      />
    </div>
  );
}
