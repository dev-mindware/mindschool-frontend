'use client';

import React, { useState } from 'react';
import { 
  DataList, 
  type Column, 
  TitleList, 
  Button, 
  Badge, 
  Icon 
} from '@/components';
import { useDropoutRisk } from "@/hooks/school/use-dropout-risk";
import { DropoutRiskAlert, RiskLevel, AlertStatus, ActionType } from '@/types/dropout-risk';
import { DropoutRiskMetrics } from './dropout-risk-metrics';
import { DropoutRiskDiagnosticModal } from './dropout-risk-diagnostic-modal';
import { DropoutRiskInterventionModal } from './dropout-risk-intervention-modal';

export function DropoutRiskPageContent() {
  const { alerts, isLoading, addInterventionAction, updateAlertStatus, getMetrics } = useDropoutRisk();

  const metrics = getMetrics();

  // Estados de Modais
  const [selectedAlert, setSelectedAlert] = useState<DropoutRiskAlert | null>(null);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);

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

    // o painel de diagnostico fecha; a lista recarrega da API
    setSelectedAlert(null);
    setIsDiagnosticOpen(false);
  };

  const handleResolveAlert = (id: string) => {
    updateAlertStatus(id, 'RESOLVED');
    setIsDiagnosticOpen(false);
  };

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

  const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'));
  const columns: Column<DropoutRiskAlert>[] = [
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
            title="Registar Ação Pedagógica"
          >
            <Icon name="UserCheck" className="w-3.5 h-3.5" />
            Intervir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TitleList
        title="Prevenção de Abandono Escolar"
        suTitle="Semáforo de alerta precoce e gestão de intervenções pedagógicas integradas (Presenças, Notas e Encarregados)."
      />

      {/* Cartões de Métricas */}
      <DropoutRiskMetrics metrics={metrics} />

      <DataList<DropoutRiskAlert>
        prefix="risco"
        rows={alerts}
        columns={columns}
        isLoading={isLoading}
        pageSize={10}
        searchPlaceholder="Pesquisar por aluno, n.º de processo, turma ou encarregado"
        searchText={(a) => `${a.studentName} ${a.studentNumber} ${a.className} ${a.guardianName}`}
        filters={[
          { key: 'risco', label: 'Risco', icon: 'ListFilter', options: [{ value: 'HIGH', label: 'Risco alto' }, { value: 'MODERATE', label: 'Risco moderado' }, { value: 'LOW', label: 'Risco baixo' }], match: (a, v) => a.riskLevel === v },
          { key: 'estado', label: 'Estado do caso', icon: 'Flag', options: [{ value: 'OPEN', label: 'Pendente' }, { value: 'IN_PROGRESS', label: 'Em acompanhamento' }, { value: 'RESOLVED', label: 'Resolvido' }, { value: 'DROPPED_OUT', label: 'Abandono' }], match: (a, v) => a.status === v },
          { key: 'turma', label: 'Turma', icon: 'Users', options: uniq(alerts.map((a) => a.className)).map((v) => ({ value: v, label: v })), match: (a, v) => a.className === v },
          { key: 'faltas', label: 'Faltas', icon: 'CalendarX', options: [{ value: 'seguidas', label: '3+ faltas seguidas' }, { value: 'alta', label: 'Mais de 25% de faltas' }], match: (a, v) => (v === 'seguidas' ? a.signals.consecutiveAbsences >= 3 : a.signals.absencePercentage > 25) },
          { key: 'notas', label: 'Notas', icon: 'TrendingDown', options: [{ value: 'negativa', label: 'Média abaixo de 10' }, { value: 'disciplinas', label: 'Com disciplinas negativas' }], match: (a, v) => (v === 'negativa' ? a.signals.currentAverage < 10 : a.signals.gradeDropSubjects.length > 0) },
        ]}
        sorts={[
          { value: 'risco', label: 'Pontuação de risco', compare: (a, b) => a.compositeRiskScore - b.compositeRiskScore },
          { value: 'aluno', label: 'Aluno', compare: (a, b) => a.studentName.localeCompare(b.studentName, 'pt') },
          { value: 'faltas', label: '% de faltas', compare: (a, b) => a.signals.absencePercentage - b.signals.absencePercentage },
        ]}
        emptyTitle="Nenhum alerta de risco encontrado"
        emptyDescription="Ajuste os filtros para ver outros casos."
        emptyIcon="ShieldAlert"
      />

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
