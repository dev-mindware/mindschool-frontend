"use client";

import React, { useState } from "react";
import {
  Button,
  Badge,
  Icon,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import { useHealthStore } from "@/stores/school/health-store";
import { PsychopedagogicalPlan, SpecialNeedType } from "@/types";
import { toast } from "sonner";

export function PsychopedagogicalView() {
  const { plans, addPsychologySession, addPsychopedagogicalPlan } = useHealthStore();

  const [selectedPlan, setSelectedPlan] = useState<PsychopedagogicalPlan | null>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);

  // New session state
  const [sessionPractitioner, setSessionPractitioner] = useState("Dra. Isabel Vunge (Psicopedagoga)");
  const [sessionType, setSessionType] = useState<"INDIVIDUAL" | "FAMILY_GUARDIAN" | "TEACHER_CONFERENCE">("INDIVIDUAL");
  const [sessionTopics, setSessionTopics] = useState("");
  const [sessionObservations, setSessionObservations] = useState("");
  const [sessionRecommendations, setSessionRecommendations] = useState("");
  const [nextSessionDate, setNextSessionDate] = useState("");

  // New plan state
  const [studentName, setStudentName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [classLevel, setClassLevel] = useState("8ª Classe");
  const [sectionName, setSectionName] = useState("Turma 8A");
  const [specialNeed, setSpecialNeed] = useState<SpecialNeedType>("ADHD");
  const [diagnosis, setDiagnosis] = useState("");
  const [coordinator, setCoordinator] = useState("Prof. Alberto Kalandula");
  const [psychologist, setPsychologist] = useState("Dra. Isabel Vunge");
  const [accommodationsInput, setAccommodationsInput] = useState("");
  const [adjustmentsInput, setAdjustmentsInput] = useState("");

  const getSpecialNeedBadge = (type: SpecialNeedType) => {
    switch (type) {
      case "AUTISM_SPECTRUM":
        return <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30">Espectro do Autismo (PEA)</Badge>;
      case "ADHD":
        return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">TDAH (Défice de Atenção / Hiperactividade)</Badge>;
      case "DYSLEXIA":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">Dislexia / Leitura</Badge>;
      case "HEARING_IMPAIRMENT":
        return <Badge variant="secondary">Deficiência Auditiva</Badge>;
      case "VISUAL_IMPAIRMENT":
        return <Badge variant="secondary">Baixa Visão / Deficiência Visual</Badge>;
      case "LEARNING_DIFFICULTY":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">Dificuldades de Aprendizagem</Badge>;
      case "GIFTED":
        return <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">Altas Habilidades / Sobredotação</Badge>;
      default:
        return <Badge variant="outline">AEE / Apoio Específico</Badge>;
    }
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!sessionTopics.trim() || !sessionRecommendations.trim()) {
      toast.error("Preencha os tópicos abordados e as recomendações da sessão");
      return;
    }

    addPsychologySession(selectedPlan.id, {
      practitionerName: sessionPractitioner,
      sessionType,
      topicsDiscussed: sessionTopics,
      observations: sessionObservations,
      recommendations: sessionRecommendations,
      nextSessionDate: nextSessionDate || undefined,
    });

    toast.success("Sessão psicopedagógica registada com sucesso!");
    setSessionModalOpen(false);

    // Reset
    setSessionTopics("");
    setSessionObservations("");
    setSessionRecommendations("");
    setNextSessionDate("");
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim() || !diagnosis.trim()) {
      toast.error("Indique o nome do estudante e o resumo do diagnóstico");
      return;
    }

    const accommodations = accommodationsInput
      ? accommodationsInput.split("\n").map((s) => s.trim()).filter(Boolean)
      : ["Acomodação curricular personalizada"];

    const adjustments = adjustmentsInput
      ? adjustmentsInput.split("\n").map((s) => s.trim()).filter(Boolean)
      : ["Lugar prioritário na sala de aula"];

    addPsychopedagogicalPlan({
      studentId: `stu-${Date.now()}`,
      studentName,
      studentNumber: studentNumber || `MS-2026-${Math.floor(Math.random() * 900 + 100)}`,
      classLevel,
      sectionName,
      specialNeedType: specialNeed,
      diagnosisSummary: diagnosis,
      pedagogicalCoordinator: coordinator,
      schoolPsychologist: psychologist,
      startDate: new Date().toISOString().split("T")[0],
      reviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
      curriculumAccommodations: accommodations,
      classroomAdjustments: adjustments,
    });

    toast.success("Plano de AEE criado com sucesso!");
    setNewPlanModalOpen(false);

    // Reset
    setStudentName("");
    setStudentNumber("");
    setDiagnosis("");
    setAccommodationsInput("");
    setAdjustmentsInput("");
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <Icon name="BrainCircuit" className="size-4 text-indigo-600" />
            Atendimento Educacional Especializado (AEE) & Inclusão Escolar
          </h3>
          <p className="text-xs text-muted-foreground">
            Acompanhamento individualizado e adaptações pedagógicas preconizadas pelas diretrizes do MED
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => setNewPlanModalOpen(true)}
        >
          <Icon name="Plus" className="size-3.5" />
          Novo Plano AEE
        </Button>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-4 rounded-lg border bg-card space-y-4 hover:border-primary/40 transition-colors"
          >
            {/* Plan Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-foreground">
                    {plan.studentName}
                  </h4>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({plan.studentNumber})
                  </span>
                  {getSpecialNeedBadge(plan.specialNeedType)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {plan.classLevel} • {plan.sectionName} | Início: {plan.startDate} | Revisão: {plan.reviewDate}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs h-8"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setSessionModalOpen(true);
                  }}
                >
                  <Icon name="CalendarPlus" className="size-3.5 text-indigo-600" />
                  Registar Sessão
                </Button>
              </div>
            </div>

            {/* Diagnosis / Summary */}
            <div className="text-xs bg-muted/20 p-3 rounded border">
              <span className="font-semibold text-foreground block mb-1">
                Diagnóstico & Parecer Psicopedagógico:
              </span>
              <p className="text-muted-foreground">{plan.diagnosisSummary}</p>
              <div className="mt-2 text-[11px] text-muted-foreground flex gap-4">
                <span><strong>Coord. Pedagógico:</strong> {plan.pedagogicalCoordinator}</span>
                <span><strong>Psicólogo(a) Escolar:</strong> {plan.schoolPsychologist}</span>
              </div>
            </div>

            {/* Curriculum Accommodations & Classroom Adjustments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-300">
                  <Icon name="FileCheck" className="size-4" />
                  Acomodações em Avaliações & Provas:
                </div>
                <ul className="list-disc list-inside space-y-1 text-blue-950 dark:text-blue-200 text-[11px]">
                  {plan.curriculumAccommodations.map((acc, i) => (
                    <li key={i}>{acc}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-900 dark:text-emerald-300">
                  <Icon name="LayoutDashboard" className="size-4" />
                  Orientações para a Sala de Aula:
                </div>
                <ul className="list-disc list-inside space-y-1 text-emerald-950 dark:text-emerald-200 text-[11px]">
                  {plan.classroomAdjustments.map((adj, i) => (
                    <li key={i}>{adj}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sessions History */}
            {plan.sessions && plan.sessions.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <span className="font-semibold text-xs text-foreground block">
                  Histórico de Sessões & Evolução ({plan.sessions.length}):
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {plan.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-2.5 rounded border bg-muted/10 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>
                          📅 {sess.date} — {sess.practitionerName} ({sess.sessionType})
                        </span>
                        {sess.nextSessionDate && (
                          <span className="text-primary font-semibold">
                            Próxima: {sess.nextSessionDate}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground">
                        <strong>Tópicos:</strong> {sess.topicsDiscussed}
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Recomendações:</strong> {sess.recommendations}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: New Session */}
      <Dialog open={sessionModalOpen} onOpenChange={setSessionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Registar Sessão Psicopedagógica
            </DialogTitle>
            {selectedPlan && (
              <p className="text-xs text-muted-foreground">
                Aluno: {selectedPlan.studentName} ({selectedPlan.classLevel})
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
            <div>
              <label className="font-medium text-foreground">Profissional Responsável</label>
              <input
                type="text"
                value={sessionPractitioner}
                onChange={(e) => setSessionPractitioner(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                required
              />
            </div>

            <div>
              <label className="font-medium text-foreground">Tipo de Sessão</label>
              <Select
                value={sessionType}
                onValueChange={(val) =>
                  setSessionType(val as "INDIVIDUAL" | "FAMILY_GUARDIAN" | "TEACHER_CONFERENCE")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual com o Aluno</SelectItem>
                  <SelectItem value="FAMILY_GUARDIAN">Com os Encarregados de Educação</SelectItem>
                  <SelectItem value="TEACHER_CONFERENCE">Reunião Pedagógica com Docentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-medium text-foreground">Tópicos Abordados *</label>
              <textarea
                rows={2}
                value={sessionTopics}
                onChange={(e) => setSessionTopics(e.target.value)}
                placeholder="Ex: Trabalho de foco e concentração, gestão de ansiedade..."
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                required
              />
            </div>

            <div>
              <label className="font-medium text-foreground">Recomendações e Encaminhamentos *</label>
              <textarea
                rows={2}
                value={sessionRecommendations}
                onChange={(e) => setSessionRecommendations(e.target.value)}
                placeholder="Orientações aos professores ou encarregados..."
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                required
              />
            </div>

            <div>
              <label className="font-medium text-foreground">Data da Próxima Sessão (Opcional)</label>
              <input
                type="date"
                value={nextSessionDate}
                onChange={(e) => setNextSessionDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSessionModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gap-1.5">
                <Icon name="Check" className="size-4" />
                Gravar Sessão
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: New Plan */}
      <Dialog open={newPlanModalOpen} onOpenChange={setNewPlanModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Criar Plano de AEE & Apoio Psicopedagógico
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground">Nome do Aluno *</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-foreground">Nº de Processo</label>
                <input
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="Ex: MS-2026-0150"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground">Classe</label>
                <input
                  type="text"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                  required
                />
              </div>
              <div>
                <label className="font-medium text-foreground">Turma</label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-foreground">Classificação de Necessidade Especial (NEE) *</label>
              <Select
                value={specialNeed}
                onValueChange={(val) => setSpecialNeed(val as SpecialNeedType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADHD">TDAH (Défice de Atenção / Hiperactividade)</SelectItem>
                  <SelectItem value="DYSLEXIA">Dislexia / Transtorno de Aprendizagem da Leitura</SelectItem>
                  <SelectItem value="AUTISM_SPECTRUM">Perturbação do Espectro do Autismo (PEA)</SelectItem>
                  <SelectItem value="LEARNING_DIFFICULTY">Dificuldade de Aprendizagem Geral</SelectItem>
                  <SelectItem value="HEARING_IMPAIRMENT">Deficiência Auditiva</SelectItem>
                  <SelectItem value="VISUAL_IMPAIRMENT">Deficiência Visual / Baixa Visão</SelectItem>
                  <SelectItem value="PHYSICAL_DISABILITY">Deficiência Motora / Física</SelectItem>
                  <SelectItem value="GIFTED">Sobredotação / Altas Habilidades</SelectItem>
                  <SelectItem value="OTHER">Outra Necessidade Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-medium text-foreground">Diagnóstico & Parecer da Equipa *</label>
              <textarea
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Descrição diagnóstica e manifestações observadas em contexto escolar..."
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                required
              />
            </div>

            <div>
              <label className="font-medium text-foreground">
                Acomodações Curriculares / Provas (1 por linha)
              </label>
              <textarea
                rows={2}
                value={accommodationsInput}
                onChange={(e) => setAccommodationsInput(e.target.value)}
                placeholder="Ex: Tempo extra de 25% nas provas&#10;Enunciados em formato simplificado"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-medium text-foreground">
                Orientações para a Sala de Aula (1 por linha)
              </label>
              <textarea
                rows={2}
                value={adjustmentsInput}
                onChange={(e) => setAdjustmentsInput(e.target.value)}
                placeholder="Ex: Lugar na primeira carteira ao centro&#10;Pausas activas de 2 minutos"
                className="w-full px-2.5 py-1.5 border rounded bg-background text-xs font-mono"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewPlanModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="gap-1.5">
                <Icon name="Check" className="size-4" />
                Criar Plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
