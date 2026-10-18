'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TitleList, Button, Icon, EmptyState, StatusLegend } from '@/components';
import { FilterPopover } from '@/components/shared/filters/filter-popover';
import { useTeachingScope } from '@/hooks/school/use-teaching-scope';
import { usePautas } from '@/hooks/school/use-pautas';
import { AssessmentTerm, ConsolidatedPauta, PautaAuditEntry } from '@/types/grade';
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
  const { isTeacher, mySections: sections, isLoading: isScopeLoading } = useTeachingScope();
  const [selectedTerm, setSelectedTerm] = useState<AssessmentTerm>('TRIMESTER_2');
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const { pautas: allPautas } = usePautas(selectedTerm, sectionIds);
  // O livro de auditoria vem da API de auditoria (ainda nao ligada nesta vista).
  const auditLogs: PautaAuditEntry[] = [];

  // Selected pauta for modals
  const router = useRouter();

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

  if (!isScopeLoading && isTeacher && sections.length === 0) {
    return (
      <div className="space-y-6">
        <TitleList
          title="Pautas Trimestrais & Homologação MED"
          suTitle="Consolidação de médias de disciplinas, validação de conformidade e fecho auditado pela Direcção Pedagógica."
        />
        <EmptyState
          icon="Table"
          title="Nenhuma Turma Atribuída"
          description="Não tem turmas atribuídas no presente ano lectivo. Os professores apenas podem consultar as pautas das turmas em que leccionam."
        />
      </div>
    );
  }

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

      <StatusLegend
        title="Estados e acções da pauta"
        items={[
          { label: "Em aberto", description: "As notas ainda se lançam e a pauta pode não estar completa. O botão «Fechar pauta» recusa se faltar alguma nota (ou a turma não tiver disciplinas ou alunos).", next: "a Direcção fecha a pauta quando estiver completa." },
          { label: "Fechada", description: "Guarda-se uma versão imutável (snapshot) e as notas ficam bloqueadas. Se for o último período, gera-se a proposta de transição de cada aluno.", next: "correcções só por reapreciação de nota, ou reabrindo a pauta." },
          { label: "Reaberta", description: "A Direcção reabriu-a com justificação (fica na auditoria). A versão guardada não se apaga; ao fechar de novo cria-se uma nova. Não se pode reabrir se já houver decisões de transição confirmadas." },
        ]}
      />

      <PautasTable
        pautas={allPautas}
        toolbar={<FilterPopover label="Trimestre" icon="CalendarRange" options={TERMS} value={selectedTerm} onChange={(val) => val && setSelectedTerm(val as AssessmentTerm)} />}
        onViewPauta={(item) => router.push(`/grades/pautas/${item.sectionId}?term=${selectedTerm}`)}
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
