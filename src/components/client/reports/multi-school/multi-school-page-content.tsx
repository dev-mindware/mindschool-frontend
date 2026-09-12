'use client';

import React, { useState, useMemo } from 'react';
import { 
  DynamicMetricCard, 
  GenericTable, 
  TitleList, 
  GlobalModal, 
  Button, 
  Badge, 
  Icon 
} from '@/components';
import { SearchHandlerWrapper } from '@/components/common';
import { useMultiSchoolStore } from '@/stores/school/multi-school-store';
import { SchoolUnitSummary } from '@/types/multi-school';

export function MultiSchoolPageContent() {
  const { units, searchQuery, setSearchQuery, getMetrics } = useMultiSchoolStore();
  const metrics = getMetrics();

  const [selectedUnit, setSelectedUnit] = useState<SchoolUnitSummary | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      return (
        unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.directorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [units, searchQuery]);

  const totalPages = Math.ceil(filteredUnits.length / PAGE_SIZE) || 1;
  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUnits.slice(start, start + PAGE_SIZE);
  }, [filteredUnits, currentPage]);

  const handleOpenDetail = (unit: SchoolUnitSummary) => {
    setSelectedUnit(unit);
    setIsDetailModalOpen(true);
  };

  const hasFilter = Boolean(searchQuery.trim());

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList Header */}
      <TitleList
        title="Painel Multi-Escola & Rede de Ensino"
        suTitle="Acompanhe a eficácia pedagógica, ocupação de capacidade e assiduidade de todas as escolas do grupo."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
            {units.length} colégios activos
          </Badge>
        </div>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={metrics.totalUnits}
          subtitle="Unidades no Grupo"
          description="Colégios activos e integrados"
          icon="Building2"
        />
        <DynamicMetricCard
          title={metrics.networkTotalStudents.toLocaleString()}
          subtitle="Total de Alunos Matriculados"
          description={`${metrics.networkTotalTeachers} docentes no grupo`}
          icon="Users"
        />
        <DynamicMetricCard
          title={`${metrics.averagePassRate}%`}
          subtitle="Aproveitamento Médio da Rede"
          description="Média combinada das unidades"
          icon="Award"
        />
        <DynamicMetricCard
          title={`${metrics.averageAttendanceRate}%`}
          subtitle="Assiduidade Docente da Rede"
          description="Pontualidade e presença"
          icon="CircleCheck"
        />
      </div>

      {/* MindGest Standard Filters Toolbar */}
      <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Pesquisar por colégio, município ou director..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        {hasFilter && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="h-10 text-xs text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" className="w-3.5 h-3.5 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Tabela de Unidades Escolares */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        {/* GenericTable */}
        <GenericTable<SchoolUnitSummary>
          data={paginatedUnits}
          page={currentPage}
          totalPages={totalPages}
          total={filteredUnits.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          columns={[
            {
              key: 'name',
              header: 'Colégio & Código',
              render: (_, item) => (
                <div>
                  <p className="font-medium text-foreground text-sm leading-snug">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.code} • {item.municipality}, {item.province}</p>
                </div>
              ),
            },
            {
              key: 'students',
              header: 'Alunos & Turmas',
              render: (_, item) => (
                <div className="text-xs">
                  <span className="font-mono font-medium text-foreground text-sm">{item.totalStudents} Alunos</span>
                  <p className="text-muted-foreground">{item.totalSections} turmas activas</p>
                </div>
              ),
            },
            {
              key: 'capacity',
              header: 'Ocupação de Salas',
              render: (_, item) => (
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-foreground font-medium">{item.capacityUtilizationPercentage}%</span>
                    <span className="text-muted-foreground">Capacidade</span>
                  </div>
                  <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.capacityUtilizationPercentage}%` }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'passRate',
              header: 'Aproveitamento',
              render: (_, item) => (
                <div className="text-xs">
                  <span className="font-medium text-emerald-600 font-mono text-sm">{item.passRatePercentage}%</span>
                  <p className="text-muted-foreground">{item.dropoutRiskCount} em risco de abandono</p>
                </div>
              ),
            },
            {
              key: 'attendance',
              header: 'Assiduidade Docente',
              render: (_, item) => (
                <div className="text-xs">
                  <span className="font-medium text-foreground font-mono text-sm">{item.attendanceRatePercentage}%</span>
                  <p className="text-muted-foreground">{item.totalTeachers} professores</p>
                </div>
              ),
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
                    onClick={() => handleOpenDetail(item)}
                    className="h-8 gap-1 text-xs"
                    title="Ver Ficha Detalhada do Colégio"
                  >
                    <Icon name="Eye" className="w-3.5 h-3.5" />
                    Detalhes
                  </Button>
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhuma unidade escolar encontrada."
        />
      </div>

      {/* Modal: Detalhes da Unidade Escolar */}
      <GlobalModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedUnit ? selectedUnit.name : 'Detalhes do Colégio'}
        className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
      >
        {selectedUnit && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-primary font-bold">{selectedUnit.code}</span>
                <h3 className="text-base font-bold text-foreground">{selectedUnit.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedUnit.address} • {selectedUnit.municipality}</p>
                <p className="text-xs text-muted-foreground mt-1">Director(a): <strong className="text-foreground">{selectedUnit.directorName}</strong></p>
              </div>
              <Badge variant="default">Unidade Operacional</Badge>
            </div>

            {/* Grid com Indicadores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold">População Escolar</span>
                <p className="text-2xl font-bold font-mono text-foreground">{selectedUnit.totalStudents}</p>
                <p className="text-xs text-muted-foreground">{selectedUnit.totalSections} turmas em 2 turnos</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold">Taxa de Sucesso</span>
                <p className="text-2xl font-bold font-mono text-emerald-600">{selectedUnit.passRatePercentage}%</p>
                <p className="text-xs text-muted-foreground">Avaliação contínua Decreto 424/25</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-bold">Assiduidade Docente</span>
                <p className="text-2xl font-bold font-mono text-primary">{selectedUnit.attendanceRatePercentage}%</p>
                <p className="text-xs text-muted-foreground">{selectedUnit.totalTeachers} professores activos</p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </GlobalModal>
    </div>
  );
}
