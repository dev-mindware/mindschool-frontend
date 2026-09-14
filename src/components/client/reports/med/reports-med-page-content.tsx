'use client';

import React, { useState, useMemo } from 'react';
import { TitleList, Button, Icon } from '@/components';
import { SearchHandlerWrapper } from '@/components/common';
import { FilterPopover } from '@/components/shared';
import { useReportsMedStore } from '@/stores/school/reports-med-store';
import { MedStatisticalReport, MedSnapshotCut } from '@/types/reports-med';
import { ReportsMedMetrics } from './reports-med-metrics';
import { ReportsMedTable } from './reports-med-table';
import { GenerateSnapshotModal } from './generate-snapshot-modal';
import { MedMapPreviewModal } from './med-map-preview-modal';

export function ReportsMedPageContent() {
  const {
    reports,
    filterCut,
    searchQuery,
    setCutFilter,
    setSearchQuery,
    generateSnapshot,
    markAsSubmittedToMED,
    getMetrics,
  } = useReportsMedStore();

  const metrics = getMetrics();

  // Modais
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isMapPreviewModalOpen, setIsMapPreviewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<MedStatisticalReport | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Filtros
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesCut = filterCut === 'ALL' || rep.snapshotCut === filterCut;
      const matchesQuery =
        rep.reportCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.provincialDirectorate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.academicYear.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCut && matchesQuery;
    });
  }, [reports, filterCut, searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / PAGE_SIZE) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredReports.slice(start, start + PAGE_SIZE);
  }, [filteredReports, currentPage]);

  const handleSaveSnapshot = (cut: MedSnapshotCut, academicYear: string) => {
    const created = generateSnapshot(cut, academicYear);
    setIsGenerateModalOpen(false);
    setSelectedReport(created);
    setIsMapPreviewModalOpen(true);
  };

  const handleViewMap = (rep: MedStatisticalReport) => {
    setSelectedReport(rep);
    setIsMapPreviewModalOpen(true);
  };

  const handleConfirmSubmission = (reportId: string, protocolNumber: string) => {
    markAsSubmittedToMED(reportId, protocolNumber);
    const updated = useReportsMedStore.getState().reports.find((r) => r.id === reportId);
    if (updated) setSelectedReport(updated);
  };

  const hasFilter = Boolean(searchQuery.trim() || filterCut !== 'ALL');

  const handleClearFilters = () => {
    setSearchQuery('');
    setCutFilter('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList Header */}
      <TitleList
        title="Mapas Estatísticos Oficiais do MED"
        suTitle="Gere e arquive snapshots estatísticos imutáveis de aproveitamento e frequência por género para submissão ao Ministério da Educação."
      >
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsGenerateModalOpen(true)}
          className="gap-2 shadow-xs text-xs font-semibold"
        >
          <Icon name="Plus" className="size-4" />
          Gerar Novo Snapshot MED
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <ReportsMedMetrics metrics={metrics} />

      {/* MindGest Standard Filters Toolbar */}
      <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Pesquisar por código, ano ou repartição..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Corte Oficial"
            icon="ListFilter"
            options={[
              { label: 'Todos os Cortes', value: 'ALL' },
              { label: 'Fecho do 1.º Trimestre', value: 'TERM_1_CLOSE' },
              { label: 'Fecho do 2.º Trimestre', value: 'TERM_2_CLOSE' },
              { label: 'Fecho Anual / Pauta Final', value: 'FINAL_YEAR' },
              { label: 'Início do Ano Lectivo', value: 'ENROLLMENT_START' },
            ]}
            value={filterCut === 'ALL' ? null : filterCut}
            onChange={(val) => {
              setCutFilter((val as MedSnapshotCut) ?? 'ALL');
              setCurrentPage(1);
            }}
          />

          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de Snapshots do MED */}
      <ReportsMedTable
        reports={paginatedReports}
        currentPage={currentPage}
        totalPages={totalPages}
        total={filteredReports.length}
        onPageChange={setCurrentPage}
        onViewMap={handleViewMap}
      />

      {/* Modal 1: Geração de Novo Snapshot MED */}
      <GenerateSnapshotModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleSaveSnapshot}
      />

      {/* Modal 2: Visualização do Mapa Estatístico Oficial A4 Padronizado do MED */}
      <MedMapPreviewModal
        isOpen={isMapPreviewModalOpen}
        onClose={() => setIsMapPreviewModalOpen(false)}
        selectedReport={selectedReport}
        onConfirmSubmission={handleConfirmSubmission}
      />
    </div>
  );
}
