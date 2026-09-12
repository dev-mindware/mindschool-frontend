'use client';

import React, { useState, useMemo } from 'react';
import { 
  GenericTable, 
  TitleList, 
  Button, 
  Badge, 
  Icon 
} from '@/components';
import { SearchHandlerWrapper } from '@/components/common/search-handler-wrapper';
import { FilterPopover } from '@/components/shared/filters/filter-popover';
import { useDropoutRiskStore } from '@/stores/school/dropout-risk-store';
import { DropoutRiskAlert, RiskLevel, AlertStatus, ActionType } from '@/types/dropout-risk';
import { DropoutRiskMetrics } from './dropout-risk-metrics';
import { DropoutRiskDiagnosticModal } from './dropout-risk-diagnostic-modal';
import { DropoutRiskInterventionModal } from './dropout-risk-intervention-modal';

export function DropoutRiskPageContent() {
  const { 
    alerts, 
    filterRiskLevel, 
    filterStatus, 
    searchQuery, 
    setRiskFilter, 
    setStatusFilter, 
    setSearchQuery, 
    addInterventionAction, 
    updateAlertStatus, 
    getMetrics 
  } = useDropoutRiskStore();

  const metrics = getMetrics();

  // Estados de Modais
  const [selectedAlert, setSelectedAlert] = useState<DropoutRiskAlert | null>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Filtragem dos alertas
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesRisk = filterRiskLevel === 'ALL' || alert.riskLevel === filterRiskLevel;
      const matchesStatus = filterStatus === 'ALL' || alert.status === filterStatus;
      const matchesQuery = 
        alert.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesRisk && matchesStatus && matchesQuery;
    });
  }, [alerts, filterRiskLevel, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredAlerts.length / PAGE_SIZE) || 1;
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, currentPage]);

  const handleOpenDiagnostic = (alert: DropoutRiskAlert) => {
    setSelectedAlert(alert);
    setIsDiagnosticOpen(true);
  };

  const handleOpenIntervention = (alert: DropoutRiskAlert) => {
    setSelectedAlert(alert);
    setIsInterventionModalOpen(true);
  };

  const handleSaveIntervention = (
    alertId: string,
    actionData: {
      actionType: ActionType;
      title: string;
      notes: string;
      recordedBy: string;
      nextFollowUpDate?: string;
    }
  ) => {
    addInterventionAction(alertId, {
      ...actionData,
      newStatus: 'IN_PROGRESS',
    });

    const updated = useDropoutRiskStore.getState().alerts.find((a) => a.id === alertId);
    if (updated) setSelectedAlert(updated);
  };

  const handleResolveAlert = (id: string) => {
    updateAlertStatus(id, 'RESOLVED');
    setIsDiagnosticOpen(false);
  };

  const handleClearFilters = () => {
    setRiskFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filterRiskLevel !== 'ALL' || filterStatus !== 'ALL' || searchQuery.trim() !== '';

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'HIGH':
        return <Badge variant="destructive" className="font-medium text-xs">Risco Alto</Badge>;
      case 'MODERATE':
        return <Badge className="bg-amber-100 text-amber-800 font-medium text-xs border-amber-300">Risco Moderado</Badge>;
      case 'LOW':
        return <Badge variant="secondary" className="font-medium text-xs">Risco Baixo</Badge>;
      default:
        return <Badge variant="outline" className="font-medium text-xs">Sob Vigilância</Badge>;
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="destructive" className="font-medium text-xs">Pendente</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 font-medium text-xs border-blue-300">Em Acompanhamento</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-emerald-100 text-emerald-800 font-medium text-xs border-emerald-300">Resolvido</Badge>;
      case 'DROPPED_OUT':
        return <Badge variant="outline" className="text-muted-foreground font-medium text-xs">Abandono</Badge>;
      default:
        return <Badge variant="outline" className="font-medium text-xs">Fechado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TitleList
        title="Prevenção de Abandono Escolar"
        suTitle="Semáforo de alerta precoce e gestão de intervenções pedagógicas integradas (Presenças, Notas e Encarregados)."
      />

      {/* Cartões de Métricas */}
      <DropoutRiskMetrics metrics={metrics} />

      {/* Tabela de Casos com Filtros */}
      <div className="bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden">
        {/* Barra de Filtros e Pesquisa */}
        <div className="p-4 border-b border-border/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <SearchHandlerWrapper
              search={searchQuery}
              setSearch={(val) => {
                setSearchQuery(val);
                setCurrentPage(1);
              }}
              placeholder="Pesquisar por aluno, número ou encarregado..."
              className="w-full sm:max-w-xs md:max-w-sm"
            />

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <FilterPopover
                label="Risco"
                icon="ListFilter"
                options={[
                  { label: 'Todos os Níveis', value: 'ALL' },
                  { label: 'Risco Alto', value: 'HIGH' },
                  { label: 'Risco Moderado', value: 'MODERATE' },
                  { label: 'Risco Baixo', value: 'LOW' },
                ]}
                value={filterRiskLevel === 'ALL' ? null : filterRiskLevel}
                onChange={(val) => {
                  setRiskFilter((val ?? 'ALL') as RiskLevel | 'ALL');
                  setCurrentPage(1);
                }}
              />

              <FilterPopover
                label="Estado"
                icon="ListFilter"
                options={[
                  { label: 'Todos os Estados', value: 'ALL' },
                  { label: 'Pendente', value: 'OPEN' },
                  { label: 'Em Acompanhamento', value: 'IN_PROGRESS' },
                  { label: 'Resolvido', value: 'RESOLVED' },
                  { label: 'Abandono', value: 'DROPPED_OUT' },
                ]}
                value={filterStatus === 'ALL' ? null : filterStatus}
                onChange={(val) => {
                  setStatusFilter((val ?? 'ALL') as AlertStatus | 'ALL');
                  setCurrentPage(1);
                }}
              />

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" className="mr-1 size-3.5" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* GenericTable */}
        <GenericTable<DropoutRiskAlert>
          data={paginatedAlerts}
          page={currentPage}
          totalPages={totalPages}
          total={filteredAlerts.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          columns={[
            {
              key: 'student',
              header: 'Aluno & Matrícula',
              render: (_, item) => (
                <div>
                  <p className="font-medium text-foreground text-sm leading-snug">{item.studentName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.studentNumber} • {item.className}</p>
                </div>
              ),
            },
            {
              key: 'riskLevel',
              header: 'Semáforo de Risco',
              render: (_, item) => (
                <div className="flex flex-col gap-1">
                  {getRiskBadge(item.riskLevel)}
                  <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.riskLevel === 'HIGH' ? 'bg-rose-500' : item.riskLevel === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.compositeRiskScore}%` }}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'signals',
              header: 'Sinais Detetados',
              render: (_, item) => (
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Icon name="CalendarX" className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-medium text-rose-700 font-mono">{item.signals.consecutiveAbsences} faltas seguidas</span>
                    <span className="text-muted-foreground">({item.signals.absencePercentage}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon name="TrendingDown" className="w-3.5 h-3.5 text-amber-500" />
                    <span>Média: <span className="text-foreground font-medium font-mono">{item.signals.currentAverage.toFixed(1)}</span></span>
                    <span>• {item.signals.gradeDropSubjects.length} disc. negativas</span>
                  </div>
                </div>
              ),
            },
            {
              key: 'guardian',
              header: 'Encarregado & Contacto',
              render: (_, item) => (
                <div className="text-xs">
                  <p className="font-medium text-foreground">{item.guardianName}</p>
                  <p className="text-muted-foreground font-mono">{item.guardianPhone}</p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Estado do Caso',
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
                    onClick={() => handleOpenDiagnostic(item)}
                    className="h-8 gap-1 text-xs font-medium"
                    title="Ver Diagnóstico Completo e Histórico"
                  >
                    <Icon name="FileText" className="w-3.5 h-3.5" />
                    Diagnóstico
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleOpenIntervention(item)}
                    className="h-8 gap-1 text-xs font-medium"
                    title="Registar Acção Pedagógica"
                  >
                    <Icon name="UserCheck" className="w-3.5 h-3.5" />
                    Intervir
                  </Button>
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhum alerta de risco de abandono encontrado com os filtros atuais."
        />
      </div>

      {/* Modal 1: Diagnóstico Detalhado do Aluno */}
      <DropoutRiskDiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        selectedAlert={selectedAlert}
        onOpenIntervention={handleOpenIntervention}
        onResolveAlert={handleResolveAlert}
      />

      {/* Modal 2: Registo de Nova Intervenção Pedagógica */}
      <DropoutRiskInterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        selectedAlert={selectedAlert}
        onSaveIntervention={handleSaveIntervention}
      />
    </div>
  );
}
