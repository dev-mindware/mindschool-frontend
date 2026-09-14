'use client';

import React, { useState, useMemo } from 'react';
import { TitleList, Button, Icon } from '@/components';
import { SearchHandlerWrapper } from '@/components/common/search-handler-wrapper';
import { FilterPopover } from '@/components/shared/filters/filter-popover';
import { useSchoolDataStore } from '@/stores/school/school-data-store';
import { useGradeStore } from '@/stores/school/grade-store';
import { AssessmentTerm, ConsolidatedPauta } from '@/types/grade';
import { ConsolidatedPautaModal } from './consolidated-pauta-modal';
import { LockPautaModal } from './lock-pauta-modal';
import { ReopenPautaModal } from './reopen-pauta-modal';
import { PautasMetrics } from './pautas-metrics';
import { PautasTable } from './pautas-table';
import { PautasAuditLogSection } from './pautas-audit-log';
import Link from 'next/link';

const TERMS: { value: AssessmentTerm; label: string }[] = [
  { value: 'TRIMESTER_1', label: '1.º Trimestre' },
  { value: 'TRIMESTER_2', label: '2.º Trimestre' },
  { value: 'TRIMESTER_3', label: '3.º Trimestre' },
];

export function PautasPageContent() {
  const { sections } = useSchoolDataStore();
  const { getConsolidatedPauta, closedPautas, auditLogs } = useGradeStore();

  const [selectedTerm, setSelectedTerm] = useState<AssessmentTerm>('TRIMESTER_1');
  const [searchTerm, setSearchTerm] = useState('');
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
      <PautasMetrics
        total={stats.total}
        closed={stats.closed}
        pending={stats.pending}
        auditCount={stats.auditCount}
      />

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
      <PautasTable
        pautas={paginatedPautas}
        currentPage={currentPage}
        totalPages={totalPages}
        total={filteredPautas.length}
        onPageChange={setCurrentPage}
        onViewPauta={(item) => {
          setViewingPauta(item);
          setIsViewOpen(true);
        }}
        onLockPauta={(item) => {
          setLockingPauta(item);
          setIsLockOpen(true);
        }}
        onReopenPauta={(item) => {
          setReopeningPauta(item);
          setIsReopenOpen(true);
        }}
      />

      {/* Livro de Auditoria Pedagógica */}
      <PautasAuditLogSection auditLogs={auditLogs} />

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
