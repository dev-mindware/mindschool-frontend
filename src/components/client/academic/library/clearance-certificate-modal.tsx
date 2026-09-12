"use client";

import React, { useState, useRef } from "react";
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
  Badge,
  Icon,
} from "@/components";
import { useLibraryStore } from "@/stores/school/library-store";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";

interface ClearanceCertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SAMPLE_STUDENTS = [
  { id: "std-01", name: "Afonso Sebastião Bento", number: "Nº 01", class: "9ª Classe A" },
  { id: "std-02", name: "Ana Beatriz Domingos", number: "Nº 02", class: "9ª Classe A" },
  { id: "std-03", name: "Carlos Daniel Kiala", number: "Nº 03", class: "9ª Classe A" },
  { id: "std-04", name: "Domingas Teresa Manuel", number: "Nº 04", class: "9ª Classe A" },
  { id: "std-05", name: "Eduardo José Van-Dúnem", number: "Nº 05", class: "9ª Classe A" },
  { id: "std-08", name: "Helena Luísa Kapita", number: "Nº 08", class: "9ª Classe A" },
];

export function ClearanceCertificateModal({
  open,
  onOpenChange,
}: ClearanceCertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { checkStudentClearance } = useLibraryStore();
  const { profile } = useSchoolSettingsStore();

  const [selectedStudentId, setSelectedStudentId] = useState<string>("std-02");

  const clearance = checkStudentClearance(selectedStudentId);
  const student = SAMPLE_STUDENTS.find((s) => s.id === selectedStudentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Icon name={"ShieldCheck" as any} className="size-4 text-emerald-600" />
            Certidão de Quitação / "Nada Consta" da Biblioteca
          </DialogTitle>

          {clearance.isCleared && (
            <Button onClick={handlePrint} size="sm" className="gap-1.5 mr-6">
              <Icon name={"Printer" as any} className="size-3.5" />
              Imprimir Certidão A4
            </Button>
          )}
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Student Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                Verificar Aluno:
              </span>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="w-[260px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_STUDENTS.map((std) => (
                    <SelectItem key={std.id} value={std.id}>
                      {std.number} - {std.name} ({std.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              {clearance.isCleared ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-xs">
                  <Icon name={"CircleCheck" as any} className="size-3" />
                  Sem Pendências (Apto para Certificado)
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <Icon name={"CircleAlert" as any} className="size-3" />
                  Com Pendências ({clearance.pendingLoansCount} obras por devolver)
                </Badge>
              )}
            </div>
          </div>

          {/* If NOT Cleared */}
          {!clearance.isCleared && (
            <div className="p-4 rounded-xl border border-rose-300 bg-rose-50/20 space-y-3">
              <div className="font-bold text-xs text-rose-700 flex items-center gap-1.5">
                <Icon name={"TriangleAlert" as any} className="size-4" />
                Impedimento de Quitação: Obras Não Devolvidas
              </div>
              <p className="text-xs text-muted-foreground">
                O estudante possui livros em atraso ou empréstimo ativo. A emissão da declaração de "Nada Consta" e a entrega de documentos oficiais pela Secretaria estão temporariamente bloqueadas até a devolução dos seguintes exemplares:
              </p>

              <div className="space-y-1.5">
                {clearance.pendingBooks.map((bk, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded bg-background border border-rose-200 text-xs">
                    <span className="font-semibold text-foreground">{bk.bookTitle}</span>
                    <Badge variant={bk.isOverdue ? "destructive" : "outline"} className="text-[10px]">
                      {bk.isOverdue ? "Prazo Vencido em " + bk.dueDate : "Devolução até " + bk.dueDate}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* If Cleared: Printable Paper Canvas */}
          {clearance.isCleared && (
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
                  BIBLIOTECA ESCOLAR CENTRAL & BANCO DE MANUAIS DO MED
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1 font-sans">
                <div className="text-sm font-black uppercase tracking-wider text-slate-900">
                  DECLARAÇÃO DE "NADA CONSTA" DA BIBLIOTECA
                </div>
                <div className="text-xs font-mono text-slate-500">
                  CERTIDÃO DE QUITAÇÃO N.º BE-NC-{new Date().getFullYear()}/{student?.id.slice(-2)}
                </div>
              </div>

              {/* Certifying Text */}
              <div className="text-xs leading-relaxed text-slate-800 space-y-3 text-justify font-sans">
                <p>
                  Para os devidos efeitos legais e académicos, a Direcção da Biblioteca Escolar Central do <strong>{profile.schoolName || "COLÉGIO PRIVADO MINDSCHOOL"}</strong> certifica que o(a) estudante <strong>{student?.name.toUpperCase()}</strong>, portador(a) do número de matrícula <strong>{student?.number}</strong>, matriculado(a) na <strong>{student?.class}</strong> no Ano Lectivo 2025/2026:
                </p>

                <div className="p-4 bg-slate-100 rounded border border-slate-200 text-center font-bold text-slate-900 text-sm">
                  NÃO CONSTA QUALQUER DÉBITO OU PENDÊNCIA DE MANUAIS ESCOLARES OU OBRAS BIBLIOGRÁFICAS
                </div>

                <p>
                  Tendo procedido à devolução integral de todos os manuais escolares do Ministério da Educação (MED) e obras literárias requisitadas durante o período lectivo, encontrando-se plenamente quite com este sector.
                </p>

                <p>
                  A presente certidão é emitida a pedido do interessado para efeitos de <strong>Matrícula, Transferência Escolar ou Emissão de Certificado de Habilitações Literárias</strong> na Secretaria Geral.
                </p>
              </div>

              {/* Date & Signatures */}
              <div className="pt-8 text-center text-xs font-sans">
                <div className="text-slate-600 mb-8">
                  Luanda, aos {new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-1">
                    <div className="border-t border-slate-400 mx-6 pt-1 font-bold text-slate-900">
                      O Bibliotecário Central
                    </div>
                    <div className="text-[10px] text-slate-500">
                      (Selo Branco e Assinatura)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="border-t border-slate-400 mx-6 pt-1 font-bold text-slate-900">
                      {profile.pedagogicDirectorName || "Profª. Maria Teresa Diogo da Silva"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Directora Pedagógica
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 pt-3 font-sans">
                Documento de autenticação oficial gerado electronicamente pelo Sistema Integrado MindSchool
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {clearance.isCleared && (
            <Button onClick={handlePrint} className="gap-1.5">
              <Icon name={"Printer" as any} className="size-3.5" />
              Imprimir Nada Consta
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
