"use client";

import React, { useState, useMemo } from "react";
import {
  TitleList,
  DynamicMetricCard,
  Button,
  Icon,
} from "@/components";
import { SearchHandlerWrapper } from "@/components/common/search-handler-wrapper";
import { FilterPopover } from "@/components/shared/filters/filter-popover";
import { GenericTable, Column } from "@/components/common/generic-table";
import { Badge } from "@/components/ui/badge";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { useGradeStore } from "@/stores/school/grade-store";
import { AssessmentTerm, ConsolidatedPauta } from "@/types/grade";
import { ConsolidatedPautaModal } from "./consolidated-pauta-modal";
import { LockPautaModal } from "./lock-pauta-modal";
import { ReopenPautaModal } from "./reopen-pauta-modal";
import Link from "next/link";

const TERMS: { value: AssessmentTerm; label: string }[] = [
  { value: "TRIMESTER_1", label: "1.º Trimestre" },
  { value: "TRIMESTER_2", label: "2.º Trimestre" },
  { value: "TRIMESTER_3", label: "3.º Trimestre" },
];

export function PautasPageContent() {
  const { sections } = useSchoolDataStore();
  const { getConsolidatedPauta, closedPautas, auditLogs } = useGradeStore();

  const [selectedTerm, setSelectedTerm] = useState<AssessmentTerm>("TRIMESTER_1");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Selected pauta for modals
  const [viewingPauta, setViewingPauta] = useState<ConsolidatedPauta | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [lockingPauta, setLockingPauta] = useState<ConsolidatedPauta | null>(null);
  const [isLockOpen, setIsLockOpen] = useState(false);

  const [reopeningPauta, setReopeningPauta] = useState<ConsolidatedPauta | null>(null);
  const [isReopenOpen, setIsReopenOpen] = useState(false);

  // Computar dados das pautas de todas as turmas para o trimestre activo
  const allPautas = useMemo(() => {
    return sections.map((sec) => getConsolidatedPauta(sec.id, selectedTerm));
  }, [sections, selectedTerm, getConsolidatedPauta, closedPautas]);

  const filteredPautas = useMemo(() => {
    return allPautas.filter(
      (p) =>
        p.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.classLevel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPautas, searchTerm]);

  const totalPages = Math.ceil(filteredPautas.length / PAGE_SIZE) || 1;
  const paginatedPautas = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredPautas.slice(start, start + PAGE_SIZE);
  }, [filteredPautas, currentPage]);

  // Estatísticas globais
  const stats = useMemo(() => {
    const total = allPautas.length;
    const closed = allPautas.filter((p) => p.isClosed).length;
    const pending = total - closed;
    const auditCount = auditLogs.filter((a) => a.term === selectedTerm).length;
    return { total, closed, pending, auditCount };
  }, [allPautas, auditLogs, selectedTerm]);

  const columns: Column<ConsolidatedPauta>[] = [
    {
      key: "sectionName",
      header: "Turma / Nível",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-sm">
            {item.sectionName}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {item.classLevel} • Turno: {item.shift}
          </span>
        </div>
      ),
    },
    {
      key: "students",
      header: "Alunos",
      render: (_, item) => (
        <span className="text-sm font-medium text-foreground">
          {item.students.length}
        </span>
      ),
    },
    {
      key: "averageClassScore",
      header: "Média da Turma",
      render: (_, item) => (
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <span
            className={
              item.averageClassScore >= 12
                ? "text-emerald-700 dark:text-emerald-400"
                : item.averageClassScore >= 10
                ? "text-blue-700 dark:text-blue-400"
                : "text-amber-700 dark:text-amber-400"
            }
          >
            {item.averageClassScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">/ 20</span>
        </div>
      ),
    },
    {
      key: "approvalRate",
      header: "Aproveitamento",
      render: (_, item) => (
        <div className="flex flex-col gap-1 w-24">
          <div className="flex justify-between text-xs font-medium">
            <span>{item.approvalRate.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${
                item.approvalRate >= 80
                  ? "bg-emerald-500"
                  : item.approvalRate >= 60
                  ? "bg-blue-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${item.approvalRate}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "missingGradesCount",
      header: "Conformidade MED",
      render: (_, item) => {
        if (item.missingGradesCount === 0) {
          return (
            <Badge
              variant="outline"
              className="text-[11px] border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
            >
              100% Lançada
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="text-[11px] border-red-300 text-red-700 bg-red-50 dark:bg-red-950/30"
          >
            {item.missingGradesCount} notas pendentes
          </Badge>
        );
      },
    },
    {
      key: "isClosed",
      header: "Estado",
      render: (_, item) => {
        if (item.isClosed) {
          return (
            <Badge variant="default" className="text-xs bg-purple-600 text-white">
              <Icon name="Lock" className="h-3 w-3 mr-1" />
              Fechada
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="text-xs border-amber-500/30 bg-amber-500/10 text-amber-700"
          >
            <Icon name="Clock" className="h-3 w-3 mr-1" />
            Em Aberto
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Ações",
      render: (_, item) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewingPauta(item);
              setIsViewOpen(true);
            }}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <Icon name="Eye" className="h-3.5 w-3.5" />
            Ver Pauta
          </Button>

          {!item.isClosed ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setLockingPauta(item);
                setIsLockOpen(true);
              }}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <Icon name="Lock" className="h-3.5 w-3.5" />
              Fechar
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReopeningPauta(item);
                setIsReopenOpen(true);
              }}
              className="h-8 px-2 text-xs text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20 gap-1"
            >
              <Icon name="RotateCcw" className="h-3.5 w-3.5" />
              Reabrir
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList
        title="Pautas Trimestrais & Homologação MED"
        suTitle="Consolidação de médias de disciplinas, validação de conformidade e fecho auditado pela Direcção Pedagógica."
      >
        <div className="flex items-center gap-2">
          <Link href="/grades/entry">
            <Button variant="outline" size="sm" className="gap-2">
              <Icon name="FileSpreadsheet" className="h-4 w-4" />
              Lançamento de Notas
            </Button>
          </Link>
          <Link href="/certificates/report-cards">
            <Button variant="default" size="sm" className="gap-2">
              <Icon name="Printer" className="h-4 w-4" />
              Boletins de Notas
            </Button>
          </Link>
        </div>
      </TitleList>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={stats.total.toString()}
          subtitle="Pautas no Trimestre"
          description="Total de turmas ativas no sistema"
          icon="ClipboardList"
        />
        <DynamicMetricCard
          title={stats.closed.toString()}
          subtitle="Pautas Homologadas"
          description="Fechadas e bloqueadas contra edição"
          icon="Lock"
        />
        <DynamicMetricCard
          title={stats.pending.toString()}
          subtitle="Pendentes de Fecho"
          description="Aguardando validação da Direcção"
          icon="Clock"
        />
        <DynamicMetricCard
          title={stats.auditCount.toString()}
          subtitle="Reaberturas Auditadas"
          description="Alterações justificadas pós-fecho"
          icon="ShieldAlert"
        />
      </div>

      {/* Filters Bar – Padrão MindGest */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card shadow-xs">
        <SearchHandlerWrapper
          search={searchTerm}
          setSearch={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Pesquisar por turma ou classe..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <FilterPopover
          label="Trimestre"
          icon="ListFilter"
          options={TERMS}
          value={selectedTerm}
          onChange={(val) => val && setSelectedTerm(val as AssessmentTerm)}
        />
      </div>

      {/* Table of Section Pautas */}
      <div className="rounded-lg border bg-card">
        <GenericTable<ConsolidatedPauta>
          columns={columns}
          data={paginatedPautas}
          page={currentPage}
          totalPages={totalPages}
          total={filteredPautas.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          emptyMessage="Nenhuma pauta encontrada com os filtros actuais."
        />
      </div>

      {/* Livro de Auditoria Pedagógica */}
      {auditLogs.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Icon name="ShieldAlert" className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-foreground">
              Livro de Auditoria Pedagógica (Registo de Fechos e Reaberturas)
            </h3>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3">Data e Hora</th>
                  <th className="py-2 px-3">Turma</th>
                  <th className="py-2 px-3">Ação</th>
                  <th className="py-2 px-3">Responsável</th>
                  <th className="py-2 px-3">Justificativa / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="py-2 px-3 font-mono text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("pt-AO")}
                    </td>
                    <td className="py-2 px-3 font-medium text-foreground">
                      {log.sectionName}
                    </td>
                    <td className="py-2 px-3">
                      <Badge
                        variant={log.action === "CLOSED" ? "default" : "outline"}
                        className={`text-[10px] ${
                          log.action === "CLOSED"
                            ? "bg-purple-600 text-white"
                            : "border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/20"
                        }`}
                      >
                        {log.action === "CLOSED" ? "Fecho Homologado" : "Reabertura Auditada"}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-foreground">{log.userName}</td>
                    <td className="py-2 px-3 text-muted-foreground max-w-xs truncate" title={log.reason}>
                      {log.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modais Integrados */}
      {viewingPauta && (
        <ConsolidatedPautaModal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setViewingPauta(null);
          }}
          pauta={viewingPauta}
          onOpenLockModal={() => {
            setIsViewOpen(false);
            setLockingPauta(viewingPauta);
            setIsLockOpen(true);
          }}
          onOpenReopenModal={() => {
            setIsViewOpen(false);
            setReopeningPauta(viewingPauta);
            setIsReopenOpen(true);
          }}
        />
      )}

      {lockingPauta && (
        <LockPautaModal
          isOpen={isLockOpen}
          onClose={() => {
            setIsLockOpen(false);
            setLockingPauta(null);
          }}
          pauta={lockingPauta}
        />
      )}

      {reopeningPauta && (
        <ReopenPautaModal
          isOpen={isReopenOpen}
          onClose={() => {
            setIsReopenOpen(false);
            setReopeningPauta(null);
          }}
          pauta={reopeningPauta}
        />
      )}
    </div>
  );
}
