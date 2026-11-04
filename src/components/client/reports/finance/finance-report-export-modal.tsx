"use client";

import React, { useState, useMemo } from "react";
import { GlobalModal, Button, Icon } from "@/components";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { formatCurrency } from "@/utils/format-currency";
import { downloadElementAsPdf } from "@/utils/export-pdf";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { formatDate } from "@/utils";
import { governmentLine, registrationLine } from "@/lib/document-header";

interface FinanceReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MonthlyRow {
  month: number;
  monthLabel: string;
  expected: number;
  collected: number;
  pending: number;
  count: number;
  rate: number;
}

export function FinanceReportExportModal({ isOpen, onClose }: FinanceReportExportModalProps) {
  const { profile, calendar } = useSchoolSettingsStore();
  const { allFees, summary } = useTuition();
  const [isDownloading, setIsDownloading] = useState(false);

  const displayYear = calendar.academicYear || "";

  const monthlyData: MonthlyRow[] = useMemo(() => {
    const map = new Map<number, MonthlyRow>();

    allFees.forEach((fee) => {
      const entry = map.get(fee.month) || {
        month: fee.month,
        monthLabel: fee.monthLabel,
        expected: 0,
        collected: 0,
        pending: 0,
        count: 0,
        rate: 0,
      };

      entry.expected += fee.totalAmount;
      if (fee.status === "PAID") {
        entry.collected += fee.totalAmount;
      } else {
        entry.pending += fee.totalAmount;
      }
      entry.count += 1;

      map.set(fee.month, entry);
    });

    // ordem do ano letivo (começa no mês de início, ex.: Setembro → Julho), não Janeiro → Dezembro
    const startMonth = Number((calendar.yearStartDate ?? "").slice(5, 7)) || 9;
    const order = (m: number) => (m - startMonth + 12) % 12;
    const list = Array.from(map.values()).sort((a, b) => order(a.month) - order(b.month));
    return list.map((item) => ({
      ...item,
      rate: item.expected > 0 ? Math.round((item.collected / item.expected) * 100) : 0,
    }));
  }, [allFees, calendar.yearStartDate]);

  // os totais saem das mesmas linhas que o quadro mostra: o resumo da API não conta as mensalidades em atraso como pendentes
  const totalExpected = monthlyData.reduce((acc, m) => acc + m.expected, 0) || summary.totalExpectedAmount;
  const totalCollected = monthlyData.reduce((acc, m) => acc + m.collected, 0) || summary.totalCollectedAmount;
  const totalPending = totalExpected - totalCollected;
  const collectionRate = summary.collectionRatePercent || (totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadElementAsPdf("finance-official-print-sheet", {
        filename: `Balancete_Financeiro_${displayYear.replace(/\//g, "-")}.pdf`,
        orientation: "portrait",
      });
      SucessMessage("Balancete financeiro transferido em PDF com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF do relatório financeiro:", err);
      ErrorMessage("Erro ao gerar o ficheiro PDF do relatório financeiro.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      size="5xl"
      title="Exportar Balancete Financeiro Oficial (PDF)"
      description="Demonstração financeira institucional e apuramento consolidado de propinas para arquivo."
    >
      <div className="space-y-4">
        {/* Folha Oficial A4 Retrato */}
        <div className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-2 sm:p-5 shadow-inner">
          <div
            id="finance-official-print-sheet"
            className="mx-auto w-full max-w-[850px] bg-card p-8 text-card-foreground border border-border shadow-md font-sans print:bg-white print:text-black print:border-black"
            style={{ minHeight: "950px" }}
          >
            {/* 1. CABEÇALHO OFICIAL */}
            <div className="border-b-2 border-border pb-4 text-center">
              <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-foreground">
                REPÚBLICA DE ANGOLA
              </div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest mt-0.5">
                MINISTÉRIO DA EDUCAÇÃO
              </div>
              <div className="text-[10px] uppercase text-muted-foreground tracking-wide mt-0.5">
                {governmentLine(profile, "ADMINISTRAÇÃO MUNICIPAL DE")}
              </div>

              <div className="mt-2.5">
                <h1 className="text-base font-semibold tracking-tight text-foreground uppercase font-serif">
                  {profile.schoolName}
                </h1>
                {profile.subTitle && <p className="text-[10px] uppercase text-muted-foreground font-medium">{profile.subTitle}</p>}
                <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{registrationLine(profile, { nif: true })}</p>
                {profile.fullAddress && <p className="text-[9px] text-muted-foreground mt-0.5">{profile.fullAddress}</p>}
              </div>

              <div className="mt-3.5 inline-block border-y-2 border-border py-1 px-8">
                <h2 className="text-sm font-semibold tracking-wider uppercase text-foreground">
                  DEMONSTRAÇÃO FINANCEIRA E BALANCETE DE PROPINAS
                </h2>
                <div className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
                  EXERCÍCIO LECTIVO {displayYear} • RELATÓRIO OFICIAL DE ARRECADAÇÃO
                </div>
              </div>
            </div>

            {/* 2. BARRA DE METADADOS */}
            <div className="grid grid-cols-4 border-b-2 border-border text-xs font-semibold text-foreground divide-x divide-border bg-muted/40">
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Ano Lectivo</span>
                <span className="font-semibold text-foreground text-xs">{displayYear}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Moeda</span>
                <span className="font-semibold text-foreground text-xs">Kwanzas (Kz / AOA)</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Data de Emissão</span>
                <span className="font-semibold text-foreground text-xs">{formatDate(new Date())}</span>
              </div>
              <div className="py-2 px-3 text-center">
                <span className="block text-[9px] font-semibold uppercase text-muted-foreground">Total de Cobranças</span>
                <span className="font-semibold text-foreground text-xs">{allFees.length} Registos</span>
              </div>
            </div>

            {/* 3. QUADRO RESUMO EXECUTIVO */}
            <div className="mt-4 border-2 border-border bg-muted/40 p-3 rounded-md">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground border-b border-border pb-1 mb-2">
                SÍNTESE EXECUTIVA DE ARRECADAÇÃO
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold text-foreground divide-x divide-border">
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Total Faturado</span>
                  <span className="font-semibold text-sm">{formatCurrency(totalExpected)}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Total Cobrado</span>
                  <span className="font-semibold text-sm">{formatCurrency(totalCollected)}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Saldo Pendente</span>
                  <span className="font-semibold text-sm">{formatCurrency(totalPending)}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-muted-foreground uppercase">Taxa de Cobrança</span>
                  <span className="font-semibold text-sm">{collectionRate}%</span>
                </div>
              </div>
            </div>

            {/* 4. TABELA ANALÍTICA MENSAL */}
            <div className="mt-4">
              <table className="w-full border-collapse border-2 border-border text-foreground text-xs">
                <thead>
                  <tr className="bg-muted/60 font-semibold border-b border-border text-center text-[10px]">
                    <th className="border-r border-border p-1.5 w-12 text-center">Mês</th>
                    <th className="border-r border-border p-1.5 text-left min-w-[120px]">Designação do Período</th>
                    <th className="border-r border-border p-1.5 w-24 text-center font-mono">Inscritos</th>
                    <th className="border-r border-border p-1.5 w-32 text-right font-mono">Faturado (Kz)</th>
                    <th className="border-r border-border p-1.5 w-32 text-right font-mono">Cobrado (Kz)</th>
                    <th className="border-r border-border p-1.5 w-32 text-right font-mono">Pendente (Kz)</th>
                    <th className="p-1.5 w-20 text-center font-semibold">Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-muted-foreground italic text-xs">
                        Nenhum registo de propinas encontrado para o exercício seleccionado.
                      </td>
                    </tr>
                  ) : (
                    monthlyData.map((m, idx) => (
                      <tr
                        key={m.month}
                        className={`border-b last:border-b-0 border-border ${idx % 2 === 1 ? "bg-muted/30" : "bg-card"}`}
                      >
                        <td className="border-r border-border py-1.5 px-1 text-center font-mono font-semibold text-[10px]">
                          {String(m.month).padStart(2, "0")}
                        </td>
                        <td className="border-r border-border py-1.5 px-2 font-semibold text-[11px] text-foreground">
                          {m.monthLabel}
                        </td>
                        <td className="border-r border-border py-1.5 px-2 text-center font-mono text-[10px]">
                          {m.count}
                        </td>
                        <td className="border-r border-border py-1.5 px-2 text-right font-mono text-[11px]">
                          {formatCurrency(m.expected)}
                        </td>
                        <td className="border-r border-border py-1.5 px-2 text-right font-mono text-[11px] font-semibold">
                          {formatCurrency(m.collected)}
                        </td>
                        <td className="border-r border-border py-1.5 px-2 text-right font-mono text-[11px]">
                          {formatCurrency(m.pending)}
                        </td>
                        <td className="py-1.5 px-1 text-center font-mono text-[10px] font-semibold">
                          {m.rate}%
                        </td>
                      </tr>
                    ))
                  )}
                  {monthlyData.length > 0 && (
                    <tr className="border-t-2 border-border bg-muted/60 font-semibold text-xs">
                      <td colSpan={3} className="border-r border-border py-2 px-2 text-left uppercase text-[10px]">
                        Total Geral Consolidado
                      </td>
                      <td className="border-r border-border py-2 px-2 text-right font-mono text-[11px]">
                        {formatCurrency(totalExpected)}
                      </td>
                      <td className="border-r border-border py-2 px-2 text-right font-mono text-[11px]">
                        {formatCurrency(totalCollected)}
                      </td>
                      <td className="border-r border-border py-2 px-2 text-right font-mono text-[11px]">
                        {formatCurrency(totalPending)}
                      </td>
                      <td className="py-2 px-1 text-center font-mono text-[11px]">
                        {collectionRate}%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. TERMO DE HOMOLOGAÇÃO E ASSINATURAS */}
            <div className="mt-5 text-justify text-[10px] leading-relaxed text-muted-foreground indent-4">
              Certifico para os devidos efeitos administrativos e fiscais que a presente demonstração reflecte a exata situação financeira de faturação e arrecadação de propinas da instituição, com base nos extractos emitidos e conferidos pela tesouraria escolar.
            </div>

            <div className="mt-8 pt-4 grid grid-cols-2 gap-12 text-center text-xs text-foreground">
              <div className="flex flex-col items-center">
                <div className="w-56 border-b border-border mb-1.5" />
                <span className="font-semibold text-[10px] uppercase">O Responsável Financeiro</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{profile.administrativeDirectorName || "Tesouraria Escolar"}</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-56 border-b border-border mb-1.5" />
                <span className="font-semibold text-[10px] uppercase">O Diretor Geral</span>
                <span className="text-[9px] text-muted-foreground mt-0.5">{profile.directorGeneralName || "Direção Geral"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Ações do Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Icon name="Info" className="w-4 h-4 text-primary" />
            <span>
              O balancete financeiro será exportado diretamente em formato PDF oficial (A4 Retrato).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Icon name="Printer" className="w-4 h-4" />
              <span>Imprimir</span>
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Icon name="Loader2" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon name="Download" className="w-4 h-4" />
              )}
              <span>Baixar Relatório (PDF)</span>
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #finance-official-print-sheet,
          #finance-official-print-sheet * {
            visibility: visible !important;
          }
          #finance-official-print-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            color: black !important;
            z-index: 9999999 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </GlobalModal>
  );
}
