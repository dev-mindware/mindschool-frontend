'use client';

import React from 'react';
import { Button, DataList, Icon, FeatureGate, type Column } from '@/components';
import { Badge } from '@/components/ui/badge';
import { ConsolidatedPauta } from '@/types/grade';

interface PautasTableProps {
  pautas: ConsolidatedPauta[];
  toolbar?: React.ReactNode;
  onViewPauta: (pauta: ConsolidatedPauta) => void;
  onLockPauta: (pauta: ConsolidatedPauta) => void;
  onReopenPauta: (pauta: ConsolidatedPauta) => void;
}

const SHIFT_PT: Record<string, string> = { MORNING: 'Manhã', AFTERNOON: 'Tarde', EVENING: 'Noite', DIURNO: 'Diurno', manha: 'Manhã', tarde: 'Tarde', noite: 'Noite', integral: 'Integral' };
const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'));

export function PautasTable({ pautas, toolbar, onViewPauta, onLockPauta, onReopenPauta }: PautasTableProps) {
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
            {item.classLevel} • Turno: {SHIFT_PT[item.shift] ?? item.shift}
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
            {item.students.some((s) => Object.keys(s.subjects).length) ? item.averageClassScore.toFixed(1) : '—'}
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
            permission={item.isClosed ? "pauta:reopen" : "pauta:close"}
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
    <DataList<ConsolidatedPauta>
      prefix="pautas"
      rows={pautas}
      columns={columns}
      pageSize={10}
      toolbar={toolbar}
      searchPlaceholder="Pesquisar por turma ou classe"
      searchText={(p) => `${p.sectionName} ${p.classLevel}`}
      filters={[
        { key: 'estado', label: 'Estado', icon: 'ListFilter', options: [{ value: 'fechada', label: 'Fechada' }, { value: 'aberta', label: 'Em aberto' }], match: (p, v) => (v === 'fechada' ? p.isClosed : !p.isClosed) },
        { key: 'classe', label: 'Classe', icon: 'GraduationCap', options: uniq(pautas.map((p) => p.classLevel)).map((v) => ({ value: v, label: v })), match: (p, v) => p.classLevel === v },
        { key: 'turno', label: 'Turno', icon: 'Sun', options: uniq(pautas.map((p) => p.shift)).map((v) => ({ value: v, label: SHIFT_PT[v] ?? v })), match: (p, v) => p.shift === v },
        { key: 'conformidade', label: 'Conformidade MED', icon: 'ShieldCheck', options: [{ value: 'completa', label: '100% lançada' }, { value: 'pendente', label: 'Com notas pendentes' }], match: (p, v) => (v === 'completa' ? p.missingGradesCount === 0 : p.missingGradesCount > 0) },
        { key: 'aproveitamento', label: 'Aproveitamento', icon: 'Gauge', options: [{ value: 'alto', label: '80% ou mais' }, { value: 'medio', label: '60 a 79%' }, { value: 'baixo', label: 'Abaixo de 60%' }], match: (p, v) => (v === 'alto' ? p.approvalRate >= 80 : v === 'medio' ? p.approvalRate >= 60 && p.approvalRate < 80 : p.approvalRate < 60) },
      ]}
      sorts={[
        { value: 'turma', label: 'Turma', compare: (a, b) => a.sectionName.localeCompare(b.sectionName, 'pt') },
        { value: 'media', label: 'Média da turma', compare: (a, b) => a.averageClassScore - b.averageClassScore },
        { value: 'aproveitamento', label: 'Aproveitamento', compare: (a, b) => a.approvalRate - b.approvalRate },
      ]}
      emptyTitle="Nenhuma pauta encontrada"
      emptyDescription="Ajuste o trimestre ou os filtros."
      emptyIcon="ClipboardList"
    />
  );
}
