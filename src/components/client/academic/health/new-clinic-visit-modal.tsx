"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Icon,
} from "@/components";
import { useHealthStore } from "@/stores/school/health-store";
import { HealthUrgencyLevel, ClinicVisitStatus } from "@/types";
import { toast } from "sonner";

interface NewClinicVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_STUDENTS = [
  { id: "stu-01", number: "MS-2026-0042", name: "Nzuzi Maria Afonso", class: "10ª Classe", section: "Turma 10A" },
  { id: "stu-02", number: "MS-2026-0089", name: "Mauro António Gaspar", class: "11ª Classe", section: "Turma 11B" },
  { id: "stu-03", number: "MS-2026-0105", name: "Esperança Domingos", class: "8ª Classe", section: "Turma 8A" },
  { id: "stu-04", number: "MS-2026-0120", name: "Joaquim Bernardo Silva", class: "7ª Classe", section: "Turma 7C" },
  { id: "stu-05", number: "MS-2026-0155", name: "Ana Beatriz Domingos", class: "9ª Classe", section: "Turma 9A" },
];

export function NewClinicVisitModal({
  open,
  onOpenChange,
}: NewClinicVisitModalProps) {
  const { registerClinicVisit, profiles } = useHealthStore();

  const [studentId, setStudentId] = useState(SAMPLE_STUDENTS[0].id);
  const [recordedBy, setRecordedBy] = useState("Enf. Graciete da Conceição");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptomsInput, setSymptomsInput] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<HealthUrgencyLevel>("ROUTINE");
  const [temperature, setTemperature] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [administeredMedication, setAdministeredMedication] = useState("");
  const [status, setStatus] = useState<ClinicVisitStatus>("UNDER_OBSERVATION");
  const [guardianNotified, setGuardianNotified] = useState(false);
  const [guardianNotes, setGuardianNotes] = useState("");

  const selectedStudent = SAMPLE_STUDENTS.find((s) => s.id === studentId);
  const studentHealthProfile = profiles.find((p) => p.studentId === studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error("Seleccione o aluno");
      return;
    }

    if (!chiefComplaint.trim()) {
      toast.error("Indique a queixa principal ou motivo do atendimento");
      return;
    }

    if (!actionsTaken.trim()) {
      toast.error("Descreva as condutas ou procedimentos realizados");
      return;
    }

    const symptomsList = symptomsInput
      ? symptomsInput.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Queixa relatada"];

    const visit = registerClinicVisit({
      studentId: selectedStudent.id,
      studentNumber: selectedStudent.number,
      studentName: selectedStudent.name,
      classLevel: selectedStudent.class,
      sectionName: selectedStudent.section,
      recordedBy,
      chiefComplaint,
      symptoms: symptomsList,
      urgencyLevel,
      vitalSigns: {
        temperatureCelsius: temperature ? parseFloat(temperature) : undefined,
        bloodPressure: bloodPressure || undefined,
        heartRateBpm: heartRate ? parseInt(heartRate, 10) : undefined,
      },
      actionsTaken,
      administeredMedication: administeredMedication || undefined,
      status,
      guardianNotified,
      guardianNotifiedAt: guardianNotified ? new Date().toISOString() : undefined,
      guardianNotes: guardianNotes || undefined,
    });

    toast.success(`Atendimento ${visit.visitNumber} registado com sucesso!`);
    onOpenChange(false);

    // Reset form
    setChiefComplaint("");
    setSymptomsInput("");
    setTemperature("");
    setBloodPressure("");
    setHeartRate("");
    setActionsTaken("");
    setAdministeredMedication("");
    setGuardianNotified(false);
    setGuardianNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <Icon name="Cross" className="size-5 text-red-600" />
            Novo Atendimento na Enfermaria Escolar
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Aluno & Perfil Clínico Rápido */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Aluno *</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_STUDENTS.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name} — {st.class} ({st.number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Alerta prévio de saúde se houver */}
            {studentHealthProfile && (studentHealthProfile.allergies.length > 0 || studentHealthProfile.chronicConditions.length > 0) && (
              <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-start gap-2 text-amber-800 dark:text-amber-300">
                <Icon name="TriangleAlert" className="size-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-xs">Alertas da Ficha Médica do Aluno:</p>
                  {studentHealthProfile.allergies.length > 0 && (
                    <p>
                      <strong>Alergias:</strong> {studentHealthProfile.allergies.join(", ")}
                    </p>
                  )}
                  {studentHealthProfile.chronicConditions.length > 0 && (
                    <p>
                      <strong>Condições Crónicas:</strong> {studentHealthProfile.chronicConditions.join(", ")}
                    </p>
                  )}
                  <p>
                    <strong>Contacto de Emergência:</strong> {studentHealthProfile.emergencyContactName} ({studentHealthProfile.emergencyContactPhone})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Queixa Principal & Gravidade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-medium text-foreground">Queixa Principal / Motivo *</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Ex: Cefaleia intensa e tonturas durante a aula"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Nível de Urgência *</label>
              <Select
                value={urgencyLevel}
                onValueChange={(val) => setUrgencyLevel(val as HealthUrgencyLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROUTINE">Rotina / Ligeiro</SelectItem>
                  <SelectItem value="MODERATE">Moderado</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                  <SelectItem value="CRITICAL">Crítico / Emergência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sintomas */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Sintomas Observados (separados por vírgula)</label>
            <input
              type="text"
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder="Ex: Febre, náuseas, dor abdominal, palidez"
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>

          {/* Sinais Vitais */}
          <div className="border rounded-md p-3 bg-muted/20 space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Icon name="HeartPulse" className="size-4 text-rose-500" />
              Sinais Vitais (Triagem)
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground">Temperatura (ºC)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="37.2"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Tensão Arterial</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="120/80"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Freq. Cardíaca (BPM)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="78"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                />
              </div>
            </div>
          </div>

          {/* Condutas & Medicação */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Procedimentos & Cuidados Prestados *</label>
            <textarea
              rows={2}
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              placeholder="Ex: Aluno colocado em repouso na maca com hidratação oral..."
              className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Medicação Ministrada (se autorizada)</label>
              <input
                type="text"
                value={administeredMedication}
                onChange={(e) => setAdministeredMedication(e.target.value)}
                placeholder="Ex: Paracetamol 500mg, Soro Oral"
                className="w-full px-3 py-2 border rounded-md bg-background text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Estado / Desfecho Inicial *</label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as ClinicVisitStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNDER_OBSERVATION">Em Observação na Enfermaria</SelectItem>
                  <SelectItem value="DISCHARGED_TO_CLASS">Alta / Retorno à Sala de Aula</SelectItem>
                  <SelectItem value="SENT_HOME">Encaminhado para Domicílio</SelectItem>
                  <SelectItem value="REFERRED_TO_HOSPITAL">Encaminhado para Hospital / Centro de Saúde</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Comunicação com Encarregado */}
          <div className="border rounded-md p-3 bg-muted/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifGuardian"
                  checked={guardianNotified}
                  onChange={(e) => setGuardianNotified(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="notifGuardian" className="font-medium text-foreground cursor-pointer">
                  Encarregado de Educação Notificado
                </label>
              </div>
              <span className="text-[11px] text-muted-foreground">Chamada / WhatsApp</span>
            </div>
            {guardianNotified && (
              <div>
                <input
                  type="text"
                  value={guardianNotes}
                  onChange={(e) => setGuardianNotes(e.target.value)}
                  placeholder="Resumo do contacto com o encarregado (ex: Mãe autorizou medicação e virá buscar o aluno)"
                  className="w-full px-2.5 py-1.5 border rounded bg-background text-xs"
                />
              </div>
            )}
          </div>

          {/* Profissional */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">Profissional Responsável</label>
            <input
              type="text"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background text-xs"
              required
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-1.5">
              <Icon name="Check" className="size-4" />
              Registar Atendimento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
