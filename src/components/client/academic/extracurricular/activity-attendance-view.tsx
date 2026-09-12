"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icon,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useExtracurricularStore } from "@/stores/school/extracurricular-store";
import { toast } from "sonner";

export function ActivityAttendanceView() {
  const { activities, enrollments, attendanceLogs, recordSessionAttendance } = useExtracurricularStore();

  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities[0]?.id || "");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sessionTopic, setSessionTopic] = useState("");

  const activeActivity = activities.find((a) => a.id === selectedActivityId) || activities[0];
  const enrolledStudents = enrollments.filter(
    (e) => e.activityId === selectedActivityId && e.status === "ACTIVE"
  );

  // Map of presence
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});

  const togglePresence = (studentId: string) => {
    setPresenceMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === false ? true : false,
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionTopic.trim()) {
      toast.error("Indique o tema ou objectivo da sessão / treino");
      return;
    }

    if (enrolledStudents.length === 0) {
      toast.error("Não existem alunos inscritos nesta actividade para registar presenças.");
      return;
    }

    const records = enrolledStudents.map((st) => ({
      activityId: activeActivity.id,
      date: sessionDate,
      sessionTopic,
      studentId: st.studentId,
      studentName: st.studentName,
      studentNumber: st.studentNumber,
      isPresent: presenceMap[st.studentId] ?? true,
      recordedBy: activeActivity.instructorName,
    }));

    recordSessionAttendance(records);
    toast.success(`Presenças da sessão "${sessionTopic}" gravadas com sucesso!`);
    setSessionTopic("");
  };

  return (
    <div className="space-y-4">
      {/* Activity Selector & Session Form */}
      <form onSubmit={handleSaveAttendance} className="bg-card p-4 rounded-lg border space-y-4 text-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Icon name="CalendarCheck" className="size-4 text-primary" />
              Registo de Presenças em Treinos & Oficinas
            </h3>
            <p className="text-xs text-muted-foreground">
              Selecione o clube e preencha a lista de chamada para o treino de hoje
            </p>
          </div>

          <Button type="submit" className="gap-1.5 text-xs h-8">
            <Icon name="Check" className="size-3.5" />
            Gravar Presenças da Sessão
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="font-medium text-foreground">Clube / Modalidade</label>
            <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
              <SelectTrigger className="text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activities.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.enrolledCount} inscritos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Input
              label="Data da Sessão"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <Input
              label="Tema da Oficina / Treino *"
              type="text"
              value={sessionTopic}
              onChange={(e) => setSessionTopic(e.target.value)}
              placeholder="Ex: Circuitos de velocidade..."
              className="h-8 text-xs"
              required
            />
          </div>
        </div>

        {/* Student Check-in List */}
        <div className="border rounded bg-muted/10 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              Alunos Inscritos ({enrolledStudents.length}):
            </span>
            <span className="text-[11px] text-muted-foreground">
              Clique para alternar entre Presente e Ausente
            </span>
          </div>

          {enrolledStudents.length === 0 ? (
            <p className="text-muted-foreground italic py-3 text-center">
              Nenhum aluno inscrito nesta actividade.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {enrolledStudents.map((st) => {
                const isPresent = presenceMap[st.studentId] ?? true;

                return (
                  <div
                    key={st.id}
                    onClick={() => togglePresence(st.studentId)}
                    className={`p-2.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                      isPresent
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-300"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs">{st.studentName}</div>
                      <div className="text-[10px] opacity-80">
                        {st.classLevel} • {st.studentNumber}
                      </div>
                    </div>
                    <Badge
                      variant={isPresent ? "default" : "destructive"}
                      className="text-[10px] h-5"
                    >
                      {isPresent ? "Presente" : "Falta"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </form>

      {/* History of Past Sessions */}
      <div className="space-y-2 pt-2">
        <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
          <Icon name="History" className="size-3.5 text-muted-foreground" />
          Histórico de Sessões Realizadas ({attendanceLogs.length} registos)
        </h4>

        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground font-medium">
                <tr>
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3">Estudante</th>
                  <th className="py-2 px-3">Tema da Sessão</th>
                  <th className="py-2 px-3">Instrutor Responsável</th>
                  <th className="py-2 px-3">Presença</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendanceLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-muted/20">
                    <td className="py-2 px-3 font-mono text-[11px] text-muted-foreground">{log.date}</td>
                    <td className="py-2 px-3 font-medium text-foreground">{log.studentName}</td>
                    <td className="py-2 px-3 text-muted-foreground">{log.sessionTopic}</td>
                    <td className="py-2 px-3 text-muted-foreground">{log.recordedBy}</td>
                    <td className="py-2 px-3">
                      <Badge
                        variant={log.isPresent ? "outline" : "destructive"}
                        className={log.isPresent ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px]" : "text-[10px]"}
                      >
                        {log.isPresent ? "Presente" : "Falta"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
