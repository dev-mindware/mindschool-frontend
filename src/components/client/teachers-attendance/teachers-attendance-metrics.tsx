'use client';

import React from 'react';
import { DynamicMetricCard } from '@/components';
import { TeacherAttendanceMetrics } from '@/types/teacher-attendance';

interface TeachersAttendanceMetricsProps {
  metrics: TeacherAttendanceMetrics;
}

export function TeachersAttendanceMetrics({ metrics }: TeachersAttendanceMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DynamicMetricCard
        title={`${metrics.presentToday} / ${metrics.totalTeachers}`}
        subtitle="Presenças Hoje"
        description="Docentes registados no turno"
        icon="CircleCheck"
      />
      <DynamicMetricCard
        title={`${metrics.punctualityRatePercentage}%`}
        subtitle="Taxa de Pontualidade"
        description={`${metrics.lateArrivalsToday} atrasos registados`}
        icon="Clock"
      />
      <DynamicMetricCard
        title={metrics.absentToday}
        subtitle="Ausências Hoje"
        description="Sujeitas a justificação"
        icon="CalendarX"
      />
      <DynamicMetricCard
        title={`${metrics.classesFulfillmentPercentage}%`}
        subtitle="Cumprimento de Aulas"
        description="Sem tempos letivos vazios"
        icon="Award"
      />
    </div>
  );
}
