'use client';

import React, { useState, useMemo } from 'react';
import { TitleList, Button, Icon } from '@/components';
import { FilterPopover } from '@/components/shared/filters/filter-popover';
import { useSections } from '@/hooks/school/use-sections';
import { usePautas } from '@/hooks/school/use-pautas';
import { AssessmentTerm, ConsolidatedPauta, PautaAuditEntry } from '@/types/grade';
import { ConsolidatedPautaModal } from './consolidated-pauta-modal';
import { LockPautaModal } from './lock-pauta-modal';
import { ReopenPautaModal } from './reopen-pauta-modal';
import { PautasMetrics } from './pautas-metrics';
import { PautasTable } from './pautas-table';
import { PautasAuditLogSection } from './pautas-audit-log';

const TERMS: { value: AssessmentTerm; label: string }[] = [
  { value: 'TRIMESTER_1', label: '1.º Trimestre' },
  { value: 'TRIMESTER_2', label: '2.º Trimestre' },
  { value: 'TRIMESTER_3', label: '3.º Trimestre' },
];

export function PautasPageContent() {
  const { data: sections = [] } = useSections();
  const [selectedTerm, setSelectedTerm] = useState<AssessmentTerm>('TRIMESTER_2');
  const { pautas: allPautas } = usePautas(selectedTerm, sections.map((s) => s.id));
  // O livro de auditoria vem da API de auditoria (ainda nao ligada nesta vista).
  const auditLogs: PautaAuditEntry[] = [];

  // Selected pauta for modals
  const [viewingPauta, setViewingPauta] = useState<ConsolidatedPauta | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [lockingPauta, setLockingPauta] = useState<ConsolidatedPauta | null>(null);
  const [isLockOpen, setIsLockOpen] = useState(false);

  const [reopeningPauta, setReopeningPauta] = useState<ConsolidatedPauta | null>(null);
  const [isReopenOpen, setIsReopenOpen] = useState(false);

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
      />

      {/* Metrics */}
      <PautasMetrics
        total={stats.total}
        closed={stats.closed}
        pending={stats.pending}
        auditCount={stats.auditCount}
      />

      <PautasTable
        pautas={allPautas}
        toolbar={<FilterPopover label="Trimestre" icon="CalendarRange" options={TERMS} value={selectedTerm} onChange={(val) => val && setSelectedTerm(val as AssessmentTerm)} />}
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
