'use client';

import React from 'react';
import { DataList, Button, Badge, Icon, type Column } from '@/components';
import { TeacherAttendanceLog, TeacherDayStatus } from '@/types/teacher-attendance';

interface TeachersAttendanceTableProps {
  logs: TeacherAttendanceLog[];
  onOpenCard: (teacherId: string) => void;
  onOpenJustify: (log: TeacherAttendanceLog) => void;
}

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'));

export function TeachersAttendanceTable({ logs, onOpenCard, onOpenJustify }: TeachersAttendanceTableProps) {
  const getStatusBadge = (status: TeacherDayStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Presente
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Atrasado
          </span>
        );
      case 'JUSTIFIED_ABSENCE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Falta Justificada
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Ausente
          </span>
        );
      case 'ON_DUTY':
        return <Badge variant="secondary" className="text-xs font-normal">Em Serviço</Badge>;
    }
  };

  const columns: Column<TeacherAttendanceLog>[] = [
  {
    key: 'teacher',
    header: 'Professor & Código',
    render: (_, item) => (
      <div>
        <p className="font-medium text-foreground text-sm leading-snug">{item.teacherName}</p>
        <p className="text-xs text-muted-foreground font-mono">{item.teacherCode} • {item.department}</p>
      </div>
    ),
  },
  {
    key: 'checkIn',
    header: 'Entrada (Check-In)',
    render: (_, item) => (
      <div className="text-xs">
        {item.checkInTime ? (
          <div>
            <span className="font-mono font-medium text-foreground">{item.checkInTime}</span>
            {item.delayMinutes && item.delayMinutes > 0 ? (
              <p className="text-[11px] text-amber-600 font-medium">+{item.delayMinutes} min de atraso</p>
            ) : (
              <p className="text-[11px] text-emerald-600">Pontual</p>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground font-mono">--:--:--</span>
        )}
      </div>
    ),
  },
  {
    key: 'checkOut',
    header: 'Saída (Check-Out)',
    render: (_, item) => (
      <div className="text-xs">
        {item.checkOutTime ? (
          <div>
            <span className="font-mono font-medium text-foreground">{item.checkOutTime}</span>
            <p className="text-[11px] text-muted-foreground">{item.durationMinutes} min em serviço</p>
          </div>
        ) : item.checkInTime ? (
          <span className="text-xs text-primary font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            Em Aula / Turno
          </span>
        ) : (
          <span className="text-muted-foreground font-mono">--:--:--</span>
        )}
      </div>
    ),
  },
  {
    key: 'classes',
    header: 'Aulas Cumpridas',
    render: (_, item) => (
      <div className="text-xs font-mono">
        <span className="font-medium text-foreground">{item.completedClassesCount}</span>
        <span className="text-muted-foreground"> / {item.scheduledClassesCount} tempos</span>
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
          onClick={() => onOpenCard(item.teacherId)}
          className="h-8 gap-1 text-xs"
          title="Ver Cartão Físico com QR Code"
        >
          <Icon name="QrCode" className="w-3.5 h-3.5" />
          Cartão QR
        </Button>

        {item.status === 'ABSENT' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onOpenJustify(item)}
            className="h-8 gap-1 text-xs"
            title="Justificar Falta com Documento"
          >
            <Icon name="FileText" className="w-3.5 h-3.5" />
            Justificar
          </Button>
        )}
      </div>
    ),
  },
  ];

  return (
    <DataList<TeacherAttendanceLog>
      prefix="docentes"
      rows={logs}
      columns={columns}
      pageSize={10}
      searchPlaceholder="Pesquisar professor, código ou departamento"
      searchText={(l) => `${l.teacherName} ${l.teacherCode} ${l.department}`}
      filters={[
        { key: 'estado', label: 'Estado', icon: 'ListFilter', options: [{ value: 'PRESENT', label: 'Presentes' }, { value: 'LATE', label: 'Atrasados' }, { value: 'JUSTIFIED_ABSENCE', label: 'Faltas justificadas' }, { value: 'ABSENT', label: 'Ausentes' }, { value: 'ON_DUTY', label: 'Em serviço' }], match: (l, v) => l.status === v },
        { key: 'departamento', label: 'Departamento', icon: 'Building2', options: uniq(logs.map((l) => l.department)).map((v) => ({ value: v, label: v })), match: (l, v) => l.department === v },
        { key: 'metodo', label: 'Método de ponto', icon: 'QrCode', options: uniq(logs.map((l) => l.checkInMethod ?? '')).map((v) => ({ value: v, label: v })), match: (l, v) => l.checkInMethod === v },
        { key: 'aulas', label: 'Aulas', icon: 'BookOpen', options: [{ value: 'completas', label: 'Todas leccionadas' }, { value: 'incompletas', label: 'Com aulas por dar' }], match: (l, v) => (v === 'completas' ? l.completedClassesCount >= l.scheduledClassesCount : l.completedClassesCount < l.scheduledClassesCount) },
        { key: 'atraso', label: 'Atraso', icon: 'Clock', options: [{ value: 'com', label: 'Com atraso' }, { value: 'sem', label: 'Sem atraso' }], match: (l, v) => (v === 'com' ? (l.delayMinutes ?? 0) > 0 : !(l.delayMinutes ?? 0)) },
      ]}
      dateFilters={[{ key: 'dia', label: 'Dia', getDate: (l) => l.date }]}
      sorts={[
        { value: 'data', label: 'Data', compare: (a, b) => a.date.localeCompare(b.date) },
        { value: 'professor', label: 'Professor', compare: (a, b) => a.teacherName.localeCompare(b.teacherName, 'pt') },
        { value: 'atraso', label: 'Minutos de atraso', compare: (a, b) => (a.delayMinutes ?? 0) - (b.delayMinutes ?? 0) },
      ]}
      emptyTitle="Nenhum registo de assiduidade docente"
      emptyDescription="Os registos aparecem quando os professores marcam o ponto."
      emptyIcon="UserCheck"
    />
  );
}
