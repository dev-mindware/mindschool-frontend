'use client';

import React from 'react';
import { Badge, ButtonOnlyAction, DataList, Icon, StatusBadge, type Column, type StatusStyle } from '@/components';
import type { ApiExam, ApiExamStatus } from '@/services/exams-service';

interface OnlineExamsTableProps {
  exams: ApiExam[];
  isLoading?: boolean;
  onOpenQuestions: (exam: ApiExam) => void;
  onOpenGoogleForm: (exam: ApiExam) => void;
  onOpenGrading: (exam: ApiExam) => void;
  onPublish: (exam: ApiExam) => void;
  onClose: (exam: ApiExam) => void;
}

const fmt = (iso: string) => new Date(iso).toLocaleString('pt-AO', { dateStyle: 'short', timeStyle: 'short' });
const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'));

const EXAM_STATUS_STYLE: Record<ApiExamStatus, StatusStyle> = {
  rascunho: { label: 'Rascunho', variant: 'warning' },
  publicada: { label: 'Publicada', variant: 'info' },
  encerrada: { label: 'Encerrada', variant: 'secondary' },
};

export function OnlineExamsTable({ exams, isLoading, onOpenQuestions, onOpenGoogleForm, onOpenGrading, onPublish, onClose }: OnlineExamsTableProps) {
  const columns: Column<ApiExam>[] = [
    {
      key: 'title',
      header: 'Prova & Disciplina',
      render: (_, e) => (
        <div>
          <p className="text-sm font-medium leading-snug">{e.title}</p>
          <p className="text-xs text-muted-foreground">{e.context?.subject_name ?? '—'} • {e.context?.section_name ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'window',
      header: 'Janela & Questões',
      render: (_, e) => (
        <div className="text-xs">
          <p className="font-medium">{fmt(e.opens_at)} → {fmt(e.closes_at)}</p>
          <p className="text-muted-foreground">{e.questions.length} questões ({e.total_score.toFixed(1)} pts){e.time_limit_minutes ? ` • ${e.time_limit_minutes} min` : ''}</p>
        </div>
      ),
    },
    {
      key: 'delivery',
      header: 'Realização',
      render: (_, e) =>
        e.delivery === 'google_forms' ? (
          <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-xs font-normal text-emerald-700"><Icon name="Link" className="size-3" />Google Forms</Badge>
        ) : (
          <Badge variant="outline" className="text-xs font-normal">Plataforma</Badge>
        ),
    },
    { key: 'status', header: 'Estado', render: (_, e) => <StatusBadge status={e.status} map={EXAM_STATUS_STYLE} className="text-xs font-normal" /> },
    {
      key: 'actions',
      header: 'Acção',
      render: (_, e) => (
        <ButtonOnlyAction
          data={e}
          actions={[
            { permission: 'exam:write', label: 'Questões', icon: 'ListChecks', onClick: onOpenQuestions },
            ...(e.status !== 'encerrada' ? [{ permission: 'exam:write', label: 'Google Forms', icon: 'Link' as const, onClick: onOpenGoogleForm }] : []),
            ...(e.status === 'rascunho' ? [{ permission: 'exam:write', label: 'Publicar', icon: 'Send' as const, onClick: onPublish }] : []),
            ...(e.status === 'publicada' ? [{ permission: 'exam:write', label: 'Encerrar', icon: 'Lock' as const, onClick: onClose }] : []),
            { permission: 'exam:write', label: 'Corrigir', icon: 'CheckCheck', onClick: onOpenGrading },
          ]}
        />
      ),
    },
  ];

  return (
    <DataList<ApiExam>
      prefix="provas-online"
      rows={exams}
      columns={columns}
      isLoading={isLoading}
      pageSize={10}
      searchPlaceholder="Pesquisar por título, disciplina ou turma"
      searchText={(e) => `${e.title} ${e.context?.subject_name ?? ''} ${e.context?.section_name ?? ''}`}
      filters={[
        { key: 'estado', label: 'Estado', icon: 'ListFilter', options: [{ value: 'publicada', label: 'Publicadas' }, { value: 'encerrada', label: 'Encerradas' }, { value: 'rascunho', label: 'Rascunhos' }], match: (e, v) => e.status === v },
        { key: 'realizacao', label: 'Realização', icon: 'Link', options: [{ value: 'nativa', label: 'Plataforma' }, { value: 'google_forms', label: 'Google Forms' }], match: (e, v) => e.delivery === v },
        { key: 'turma', label: 'Turma', icon: 'Users', options: uniq(exams.map((e) => e.context?.section_name ?? '')).map((v) => ({ value: v, label: v })), match: (e, v) => e.context?.section_name === v },
        { key: 'disciplina', label: 'Disciplina', icon: 'BookOpen', options: uniq(exams.map((e) => e.context?.subject_name ?? '')).map((v) => ({ value: v, label: v })), match: (e, v) => e.context?.subject_name === v },
        { key: 'tempo', label: 'Tempo limite', icon: 'Clock', options: [{ value: 'com', label: 'Com tempo limite' }, { value: 'sem', label: 'Sem tempo limite' }], match: (e, v) => (v === 'com' ? Boolean(e.time_limit_minutes) : !e.time_limit_minutes) },
      ]}
      dateFilters={[{ key: 'abertura', label: 'Abertura', getDate: (e) => e.opens_at }]}
      sorts={[
        { value: 'abertura', label: 'Data de abertura', compare: (a, b) => a.opens_at.localeCompare(b.opens_at) },
        { value: 'titulo', label: 'Título', compare: (a, b) => a.title.localeCompare(b.title, 'pt') },
        { value: 'questoes', label: 'N.º de questões', compare: (a, b) => a.questions.length - b.questions.length },
      ]}
      emptyTitle="Nenhuma prova online encontrada"
      emptyDescription="Crie uma prova para a ver aqui."
      emptyIcon="FileText"
    />
  );
}
