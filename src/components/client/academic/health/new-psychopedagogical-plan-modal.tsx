"use client";

import React, { useState } from "react";
import {
  Button,
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
import { PsychopedagogicalPlan, SpecialNeedType } from "@/types";
import { toast } from "sonner";

interface NewPsychopedagogicalPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (
    planData: Omit<PsychopedagogicalPlan, "id" | "createdAt" | "updatedAt" | "sessions">
  ) => void;
}

export function NewPsychopedagogicalPlanModal({
  isOpen,
  onClose,
  onSavePlan,
}: NewPsychopedagogicalPlanModalProps) {
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

    onSavePlan({
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
    onClose();

    // Reset
    setStudentName("");
    setStudentNumber("");
    setDiagnosis("");
    setAccommodationsInput("");
    setAdjustmentsInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
              onClick={onClose}
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
  );
}
