"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Icon,
} from "@/components";
import { StudentHealthProfile, ClinicVisitRecord } from "@/types";

interface MedicalReportPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: StudentHealthProfile | null;
  visit?: ClinicVisitRecord | null;
}

export function MedicalReportPrintModal({
  open,
  onOpenChange,
  profile,
  visit,
}: MedicalReportPrintModalProps) {
  if (!profile && !visit) return null;

  const studentName = profile?.studentName || visit?.studentName || "Aluno";
  const studentNumber = profile?.studentNumber || visit?.studentNumber || "---";
  const classLevel = profile?.classLevel || visit?.classLevel || "---";
  const sectionName = profile?.sectionName || visit?.sectionName || "---";
  const bloodType = profile?.bloodType || "A apurar";
  const allergies = profile?.allergies || [];
  const chronicConditions = profile?.chronicConditions || [];
  const regularMedications = profile?.regularMedications || [];
  const emergencyContact = profile
    ? `${profile.emergencyContactName} (${profile.emergencyContactPhone})`
    : "Não especificado";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Icon name="Printer" className="size-5 text-primary" />
              Documento Oficial de Saúde Escolar (A4)
            </span>
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Icon name="Printer" className="size-4" />
              Imprimir Ficha
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Official A4 Document Area */}
        <div className="bg-white text-black p-8 rounded-lg shadow-sm border border-neutral-200 print:border-none print:shadow-none font-serif text-[13px] leading-relaxed space-y-6">
          {/* Official Angolan Header */}
          <div className="text-center space-y-1 border-b border-neutral-300 pb-4">
            <div className="flex justify-center mb-1">
              <div className="w-10 h-10 border border-neutral-800 rounded-full flex items-center justify-center font-bold text-xs bg-neutral-100">
                🇦🇴
              </div>
            </div>
            <p className="font-bold text-xs uppercase tracking-widest text-neutral-800">
              República de Angola
            </p>
            <p className="text-[11px] uppercase tracking-wider text-neutral-600">
              Governo Provincial de Luanda • Direcção Municipal da Educação
            </p>
            <p className="font-bold text-sm text-neutral-900 tracking-wide mt-1">
              COMPLEXO ESCOLAR PRIVADO MINDSCHOOL
            </p>
            <p className="text-[11px] italic text-neutral-700">
              Gabinete de Saúde Escolar, Enfermaria & Apoio Psicopedagógico
            </p>
          </div>

          {/* Document Title */}
          <div className="text-center py-2 bg-neutral-50 border-y border-neutral-200">
            <h2 className="font-bold text-base tracking-wider uppercase text-neutral-900">
              {visit ? "Guia de Encaminhamento Clínico / Atendimento Escolar" : "Ficha Clínica Escolar do Estudante"}
            </h2>
            <p className="text-[11px] text-neutral-500">
              Referência: {visit ? visit.visitNumber : `FICHA-MED-2026/${studentNumber.replace(/\D/g, "") || "001"}`}
            </p>
          </div>

          {/* Student Identification */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 border-b pb-0.5">
              1. Identificação do Aluno
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px]">Nome Completo:</span>
                <strong className="text-neutral-900">{studentName}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Nº de Processo:</span>
                <strong className="text-neutral-900">{studentNumber}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Classe & Turma:</span>
                <strong className="text-neutral-900">{classLevel} — {sectionName}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Grupo Sanguíneo:</span>
                <span className="inline-block px-2 py-0.5 rounded bg-neutral-100 font-bold text-neutral-900 border">
                  {bloodType}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Seguro Escolar:</span>
                <strong className="text-neutral-900">{profile?.healthInsuranceProvider || "Não registado"}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">Contacto de Emergência:</span>
                <strong className="text-neutral-900">{emergencyContact}</strong>
              </div>
            </div>
          </div>

          {/* Critical Clinical Alerts */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 border-b pb-0.5">
              2. Antecedentes & Alertas Clínicos Críticos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-red-50/60 border border-red-200 rounded">
                <span className="font-bold text-red-900 block text-[11px] mb-1">
                  ⚠️ Alergias Medicamentosas & Alimentares:
                </span>
                {allergies.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-red-950 font-medium">
                    {allergies.map((alg, i) => (
                      <li key={i}>{alg}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-600 italic">Nenhuma reacção alérgica grave reportada.</p>
                )}
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded">
                <span className="font-bold text-amber-900 block text-[11px] mb-1">
                  🩺 Condições Médicas Crónicas / Vigilância:
                </span>
                {chronicConditions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-amber-950 font-medium">
                    {chronicConditions.map((cond, i) => (
                      <li key={i}>{cond}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-neutral-600 italic">Sem diagnóstico de patologias crónicas.</p>
                )}
              </div>
            </div>

            {regularMedications.length > 0 && (
              <div className="text-xs p-2 bg-neutral-50 border rounded">
                <strong>Medicação Contínua / SOS:</strong> {regularMedications.join(", ")}
              </div>
            )}

            {profile?.physicalRestrictions && profile.physicalRestrictions.length > 0 && (
              <div className="text-xs p-2 bg-neutral-50 border rounded">
                <strong>Restrições de Actividade Física:</strong> {profile.physicalRestrictions.join(", ")}
              </div>
            )}
          </div>

          {/* Specific Visit / Incident Details (if opened from a visit) */}
          {visit && (
            <div className="space-y-2 border-t pt-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 border-b pb-0.5">
                3. Relatório da Ocorrência na Enfermaria Escolar
              </h3>
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>Data/Hora do Atendimento:</strong> {new Date(visit.recordedAt).toLocaleString("pt-AO")}</p>
                  <p><strong>Profissional Atendente:</strong> {visit.recordedBy}</p>
                  <p><strong>Nível de Urgência:</strong> {visit.urgencyLevel}</p>
                  <p><strong>Estado / Encaminhamento:</strong> {visit.status}</p>
                </div>

                <div className="p-2.5 bg-neutral-50 border rounded space-y-1">
                  <p><strong>Queixa Principal:</strong> {visit.chiefComplaint}</p>
                  <p><strong>Sintomas Apresentados:</strong> {visit.symptoms.join(", ")}</p>
                  {visit.vitalSigns && (
                    <p>
                      <strong>Sinais Vitais:</strong> Temp: {visit.vitalSigns.temperatureCelsius || "--"}ºC | TA: {visit.vitalSigns.bloodPressure || "--"} | FC: {visit.vitalSigns.heartRateBpm || "--"} bpm
                    </p>
                  )}
                  <p><strong>Cuidados e Conduta:</strong> {visit.actionsTaken}</p>
                  {visit.administeredMedication && (
                    <p><strong>Medicação Ministrada:</strong> {visit.administeredMedication}</p>
                  )}
                  {visit.guardianNotes && (
                    <p><strong>Contacto com Encarregado:</strong> {visit.guardianNotes}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Legal / Institutional Declaration */}
          <div className="text-[11px] text-neutral-600 text-justify pt-2">
            Este documento é emitido pelo Gabinete de Saúde Escolar do Complexo Escolar Privado MindSchool para fins de acompanhamento pedagógico, arquivo individual do aluno e eventual apresentação perante unidades hospitalares ou serviços de emergência médica.
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-neutral-400 w-4/5 mx-auto mb-1.5" />
              <p className="font-bold text-neutral-900">Enfermaria Escolar / Corpo Clínico</p>
              <p className="text-[10px] text-neutral-500">Assinatura & Cédula Profissional</p>
            </div>
            <div>
              <div className="border-b border-neutral-400 w-4/5 mx-auto mb-1.5" />
              <p className="font-bold text-neutral-900">A Direcção Pedagógica</p>
              <p className="text-[10px] text-neutral-500">Carimbo Institucional em Branco</p>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Icon name="Printer" className="size-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
