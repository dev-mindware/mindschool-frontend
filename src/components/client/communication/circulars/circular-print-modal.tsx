"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Icon,
} from "@/components";
import { SchoolCircular } from "@/types";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";

interface CircularPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circular: SchoolCircular | null;
}

export function CircularPrintModal({
  open,
  onOpenChange,
  circular,
}: CircularPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { profile } = useSchoolSettingsStore();

  if (!circular) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name={"Printer" as any} className="size-4 text-primary" />
            Pré-visualização da Circular Oficial para Impressão e Vitrine
          </DialogTitle>
          <Button onClick={handlePrint} size="sm" className="gap-1.5 mr-6">
            <Icon name={"Printer" as any} className="size-3.5" />
            Imprimir Circular A4
          </Button>
        </DialogHeader>

        {/* Printable Canvas */}
        <div
          ref={printRef}
          className="bg-white text-slate-900 p-8 rounded-lg border border-slate-200 shadow-xs space-y-6 font-serif print:p-0 print:border-0 print:shadow-none"
        >
          {/* Header */}
          <div className="text-center space-y-1 border-b pb-4 border-slate-300 font-sans">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
              REPÚBLICA DE ANGOLA
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              GOVERNO PROVINCIAL DE LUANDA • DIRECÇÃO MUNICIPAL DA EDUCAÇÃO
            </div>
            <div className="text-base font-black uppercase text-slate-900 pt-1">
              {profile.schoolName || "COLÉGIO PRIVADO MINDSCHOOL"}
            </div>
            <div className="text-[11px] text-slate-500">
              {profile.decreeNumber || "Decreto Executivo n.º 148/18"} • NIF: {profile.taxNumber || "5417082910"} • {profile.fullAddress}
            </div>
          </div>

          {/* Circular Title Banner */}
          <div className="text-center space-y-1 font-sans">
            <div className="text-xs font-bold uppercase tracking-widest text-primary">
              CIRCULAR INFORMATIVA N.º {circular.circularNumber}
            </div>
            <div className="text-sm font-bold text-slate-600">
              DESTINATÁRIOS: <span className="uppercase text-slate-900">{circular.audienceLabel}</span>
            </div>
            <div className="text-xs text-slate-500">
              Luanda, {new Date(circular.publishedAt.slice(0, 10)).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>

          {/* Subject / Ementa */}
          <div className="p-3 bg-slate-100 rounded border border-slate-200 text-xs font-sans">
            <span className="font-bold text-slate-800">ASSUNTO:</span>{" "}
            <strong className="text-slate-900">{circular.title}</strong>
            {circular.subtitle && (
              <div className="text-slate-600 mt-0.5 italic">{circular.subtitle}</div>
            )}
          </div>

          {/* Event details if meeting */}
          {circular.eventDate && (
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-sans grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500">Data Prevista:</span>{" "}
                <strong className="text-slate-900">{new Date(circular.eventDate).toLocaleDateString("pt-PT")}</strong>
              </div>
              <div>
                <span className="text-slate-500">Hora:</span>{" "}
                <strong className="text-slate-900">{circular.eventTime || "09:30"}</strong>
              </div>
              <div>
                <span className="text-slate-500">Local da Sessão:</span>{" "}
                <strong className="text-slate-900">{circular.eventLocation || "Salão Nobre"}</strong>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="text-xs leading-relaxed text-slate-800 space-y-3 whitespace-pre-line text-justify">
            {circular.content}
          </div>

          {/* Agenda items if meeting */}
          {circular.agendaItems && circular.agendaItems.length > 0 && (
            <div className="space-y-1.5 font-sans pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
                Ponto de Ordem / Agenda dos Trabalhos
              </div>
              <ul className="space-y-1 text-xs text-slate-700 pl-2">
                {circular.agendaItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Closing & Signatures */}
          <div className="pt-8 text-center text-xs font-sans">
            <p className="text-slate-600 mb-8 italic">
              Sem outro assunto de momento, subscrevemo-nos com a mais elevada consideração e estima pedagógica.
            </p>

            <div className="max-w-xs mx-auto space-y-1">
              <div className="border-t border-slate-400 pt-2 font-bold text-slate-900">
                {circular.authorName}
              </div>
              <div className="text-slate-600 text-[11px]">
                {circular.authorRole}
              </div>
              <div className="text-[10px] text-slate-400">
                (Selo Branco e Assinatura Homologada)
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Icon name={"Printer" as any} className="size-3.5" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
