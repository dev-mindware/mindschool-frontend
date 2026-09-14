'use client';

import React from 'react';
import { GenericTable, Column } from '@/components/common/generic-table';
import { Button, Icon, FeatureGate } from '@/components';
import { Badge } from '@/components/ui/badge';
import { ConsolidatedPauta } from '@/types/grade';

interface PautasTableProps {
  pautas: ConsolidatedPauta[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewPauta: (pauta: ConsolidatedPauta) => void;
  onLockPauta: (pauta: ConsolidatedPauta) => void;
  onReopenPauta: (pauta: ConsolidatedPauta) => void;
}

export function PautasTable({
  pautas,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onViewPauta,
  onLockPauta,
  onReopenPauta,
}: PautasTableProps) {
  const columns: Column<ConsolidatedPauta>[] = [
    {
      key: 'sectionName',
      header: 'Turma / Nível',
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
      key: 'students',
      header: 'Alunos',
      render: (_, item) => (
        <span className="text-sm font-medium text-foreground">
          {item.students.length}
        </span>
      ),
    },
    {
      key: 'averageClassScore',
      header: 'Média da Turma',
      render: (_, item) => (
        <div className="flex items-center gap-1.5 font-medium text-sm">
          <span
            className={
              item.averageClassScore >= 12
                ? 'text-success'
                : item.averageClassScore >= 10
                ? 'text-info'
                : 'text-warning'
            }
          >
            {item.averageClassScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted-foreground font-normal">/ 20</span>
        </div>
      ),
    },
    {
      key: 'approvalRate',
      header: 'Aproveitamento',
      render: (_, item) => (
        <div className="flex flex-col gap-1 w-24">
          <div className="flex justify-between text-xs font-medium">
            <span>{item.approvalRate.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full ${
                item.approvalRate >= 80
                  ? 'bg-success'
                  : item.approvalRate >= 60
                  ? 'bg-info'
                  : 'bg-warning'
              }`}
              style={{ width: `${item.approvalRate}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'missingGradesCount',
      header: 'Conformidade MED',
      render: (_, item) => {
        if (item.missingGradesCount === 0) {
          return (
            <Badge
              variant="success"
              className="text-[11px] font-normal"
            >
              100% Lançada
            </Badge>
          );
        }
        return (
          <Badge
            variant="destructive"
            className="text-[11px] font-normal"
          >
            {item.missingGradesCount} notas pendentes
          </Badge>
        );
      },
    },
    {
      key: 'isClosed',
      header: 'Estado',
      render: (_, item) => {
        if (item.isClosed) {
          return (
            <Badge variant="default" className="text-xs font-normal">
              <Icon name="Lock" className="h-3 w-3 mr-1" />
              Fechada
            </Badge>
          );
        }
        return (
          <Badge
            variant="warning"
            className="text-xs font-normal"
          >
            <Icon name="Clock" className="h-3 w-3 mr-1" />
            Em Aberto
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (_, item) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPauta(item)}
            className="h-8 px-2.5 text-xs gap-1"
          >
            <Icon name="Eye" className="h-3.5 w-3.5" />
            Ver Pauta
          </Button>

          <FeatureGate
            module="grade_closing"
            action="approve"
            roles={["PEDAGOGIC_DIRECTOR", "DIRECTOR_GENERAL", "OWNER"]}
            fallback="disabled"
            tooltipMessage="Apenas a Direção Pedagógica possui autoridade para fechar ou reabrir pautas."
          >
            {!item.isClosed ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => onLockPauta(item)}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <Icon name="Lock" className="h-3.5 w-3.5" />
                Fechar
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReopenPauta(item)}
                className="h-8 px-2 text-xs text-amber-600 hover:bg-amber-500/10 gap-1"
              >
                <Icon name="RotateCcw" className="h-3.5 w-3.5" />
                Reabrir
              </Button>
            )}
          </FeatureGate>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-lg border bg-card">
      <GenericTable<ConsolidatedPauta>
        columns={columns}
        data={pautas}
        page={currentPage}
        totalPages={totalPages}
        total={total}
        setPage={onPageChange}
        goToNextPage={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        goToPreviousPage={() => onPageChange(Math.max(1, currentPage - 1))}
        emptyMessage="Nenhuma pauta encontrada para os filtros selecionados."
      />
    </div>
  );
}
