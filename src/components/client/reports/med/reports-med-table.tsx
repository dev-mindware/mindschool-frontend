'use client';

import React from 'react';
import { GenericTable, Button, Badge, Icon } from '@/components';
import { MedStatisticalReport, MedSnapshotCut, ReportSubmissionStatus } from '@/types/reports-med';

interface ReportsMedTableProps {
  reports: MedStatisticalReport[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewMap: (report: MedStatisticalReport) => void;
}

export function ReportsMedTable({
  reports,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onViewMap,
}: ReportsMedTableProps) {
  const getCutLabel = (cut: MedSnapshotCut) => {
    switch (cut) {
      case 'ENROLLMENT_START':
        return 'Início do Ano Lectivo (Abertura)';
      case 'TERM_1_CLOSE':
        return 'Fecho do 1.º Trimestre';
      case 'TERM_2_CLOSE':
        return 'Fecho do 2.º Trimestre';
      case 'FINAL_YEAR':
        return 'Fecho Anual / Pauta Final';
    }
  };

  const getStatusBadge = (status: ReportSubmissionStatus) => {
    switch (status) {
      case 'OFFICIALLY_SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Icon name="CircleCheck" className="w-3.5 h-3.5 text-emerald-600" />
            Submetido ao MED
          </span>
        );
      case 'DRAFT':
        return <Badge variant="secondary" className="text-xs font-normal">Snapshot em Rascunho</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <GenericTable<MedStatisticalReport>
        data={reports}
        page={currentPage}
        totalPages={totalPages}
        total={total}
        setPage={onPageChange}
        goToNextPage={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        goToPreviousPage={() => onPageChange(Math.max(1, currentPage - 1))}
        columns={[
          {
            key: 'code',
            header: 'Código & Corte Oficial',
            render: (_, item) => (
              <div>
                <span className="font-mono font-medium text-foreground text-sm leading-snug">{item.reportCode}</span>
                <p className="text-xs text-muted-foreground">{getCutLabel(item.snapshotCut)}</p>
              </div>
            ),
          },
          {
            key: 'academicYear',
            header: 'Ano & Repartição',
            render: (_, item) => (
              <div className="text-xs">
                <p className="font-medium text-foreground font-mono">{item.academicYear}</p>
                <p className="text-muted-foreground">{item.municipalDirectorate}</p>
              </div>
            ),
          },
          {
            key: 'demographics',
            header: 'Alunos & Género',
            render: (_, item) => (
              <div className="text-xs font-mono">
                <p className="font-medium text-foreground">{item.totalStudents.total} Alunos Auditados</p>
                <p className="text-muted-foreground">{item.totalStudents.female} Fem • {item.totalStudents.male} Masc</p>
              </div>
            ),
          },
          {
            key: 'passRate',
            header: 'Aproveitamento',
            render: (_, item) => (
              <div className="text-xs">
                <span className="font-medium text-emerald-600 font-mono text-sm">{item.overallPassRate.toFixed(1)}%</span>
                <p className="text-muted-foreground">{item.totalPassed.total} Aprovados</p>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Estado',
            render: (_, item) => getStatusBadge(item.status),
          },
          {
            key: 'actions',
            header: 'Ações',
            className: 'text-right',
            render: (_, item) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewMap(item)}
                  className="h-8 gap-1 text-xs"
                  title="Visualizar Mapa Estatístico Oficial A4"
                >
                  <Icon name="FileSpreadsheet" className="w-3.5 h-3.5" />
                  Ver Mapa A4
                </Button>
              </div>
            ),
          },
        ]}
        emptyMessage="Nenhum relatório estatístico do MED gerado com os filtros atuais."
      />
    </div>
  );
}
