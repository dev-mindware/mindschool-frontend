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
import { ActivityEnrollment, ExtracurricularActivity } from "@/types";

interface ActivityCertificatePrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: ActivityEnrollment | null;
  activity?: ExtracurricularActivity | null;
}

export function ActivityCertificatePrintModal({
  open,
  onOpenChange,
  enrollment,
  activity,
}: ActivityCertificatePrintModalProps) {
  if (!enrollment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Icon name="Award" className="size-5 text-amber-500" />
              Certificado de Participação & Mérito Extracurricular (A4)
            </span>
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Icon name="Printer" className="size-4" />
              Imprimir Certificado
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Certificate Sheet (A4 Landscape Feel inside Portrait Container) */}
        <div className="bg-white text-black p-10 rounded-lg shadow-sm border-4 border-double border-amber-600/60 print:border-none print:shadow-none font-serif text-[13px] leading-relaxed space-y-6 text-center">
          {/* Top Emblem and Header */}
          <div className="space-y-1 border-b border-neutral-300 pb-4">
            <div className="flex justify-center mb-1">
              <div className="w-12 h-12 border-2 border-amber-700 rounded-full flex items-center justify-center font-bold text-sm bg-amber-50 text-amber-900">
                ⭐
              </div>
            </div>
            <p className="font-bold text-xs uppercase tracking-widest text-neutral-800">
              República de Angola • Governo Provincial de Luanda
            </p>
            <p className="text-[11px] text-neutral-600 uppercase tracking-wider">
              Ministério da Educação • Direcção Municipal da Educação
            </p>
            <h2 className="font-bold text-lg text-neutral-900 tracking-wide mt-1">
              COMPLEXO ESCOLAR PRIVADO MINDSCHOOL
            </h2>
            <p className="text-xs italic text-neutral-600">
              Gabinete de Desporto, Cultura & Desenvolvimento Extracurricular
            </p>
          </div>

          {/* Certificate Title */}
          <div className="py-2">
            <h1 className="font-bold text-xl uppercase tracking-widest text-amber-900">
              Certificado de Participação & Mérito
            </h1>
            <p className="text-xs text-neutral-500 font-sans tracking-wide mt-0.5">
              REGISTO Nº CERT-EXT-2026/{enrollment.studentNumber.replace(/\D/g, "") || "001"}
            </p>
          </div>

          {/* Certificate Body Text */}
          <div className="max-w-xl mx-auto text-justify text-neutral-800 text-sm leading-loose space-y-3">
            <p>
              Certifica-se, para os devidos efeitos de formação integral e registo curricular, que o(a) estudante{" "}
              <strong className="text-base text-neutral-950 underline underline-offset-4 font-bold">
                {enrollment.studentName}
              </strong>
              , portador(a) do processo escolar nº{" "}
              <strong className="font-mono text-neutral-900">{enrollment.studentNumber}</strong>, matriculado(a) na{" "}
              <strong>{enrollment.classLevel} ({enrollment.sectionName})</strong>, participou activamente e com comprovada assiduidade e dedicação nas actividades do:
            </p>

            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md text-center">
              <h3 className="font-bold text-base text-amber-950">
                {enrollment.activityName}
              </h3>
              {activity && (
                <p className="text-xs text-neutral-600 mt-0.5">
                  Orientação Técnica: {activity.instructorName} • {activity.scheduleDays}
                </p>
              )}
            </div>

            {enrollment.achievements && enrollment.achievements.length > 0 && (
              <div className="text-xs text-center p-2 bg-neutral-50 border rounded">
                <strong>Menções Honrosas & Destaques:</strong>
                <ul className="list-inline space-x-2 mt-1 font-semibold text-amber-900">
                  {enrollment.achievements.map((ach, i) => (
                    <li key={i} className="inline-block">🏆 {ach}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-neutral-600 text-center pt-2">
              Durante o ano lectivo de 2025/2026, demonstrando espírito de equipa, disciplina, criatividade e elevação dos valores humanísticos e cívicos do colégio.
            </p>
          </div>

          <div className="text-xs text-neutral-500 pt-3">
            Luanda, aos {new Date().toLocaleDateString("pt-AO", { day: "numeric", month: "long", year: "numeric" })}.
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-neutral-400 w-4/5 mx-auto mb-1.5" />
              <p className="font-bold text-neutral-900">
                {activity?.instructorName || "O(A) Instrutor(a) / Treinador(a)"}
              </p>
              <p className="text-[10px] text-neutral-500">Coordenação da Actividade</p>
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
            Imprimir Certificado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
