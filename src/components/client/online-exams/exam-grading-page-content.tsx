'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { Button, Badge, EmptyState, Icon, Input, TitleList } from '@/components';
import { useExamSubmissionDetail, useExamSubmissions, useOnlineExams } from '@/hooks/school/use-online-exams';
import type { ApiExamSubmission, ApiSubmissionDetail } from '@/services/exams-service';
import { getApiErrorMessage } from '@/utils/api-error';

const STATUS_LABEL: Record<ApiExamSubmission['status'], string> = {
  em_curso: 'Em curso',
  submetida: 'Por corrigir',
  corrigida_automaticamente: 'Corrigida (auto)',
  corrigida_manualmente: 'Corrigida',
  confirmada: 'Nota lançada',
};

const show = (v: ApiSubmissionDetail['answers'][number]['value'], options: Array<{ id: string; text: string }> | null) => {
  if (v === null || v === '' || v === undefined) return null;
  const label = (id: string) => options?.find((o) => o.id === id)?.text ?? id;
  if (Array.isArray(v)) return v.map(label).join(', ');
  if (typeof v === 'boolean') return v ? 'Verdadeiro' : 'Falso';
  if (v === 'true') return 'Verdadeiro';
  if (v === 'false') return 'Falso';
  return label(v);
};

/** Mesa de correcção: submissões da prova (nativas e importadas do Google Forms), correcção das dissertativas e lançamento da nota na mini-pauta. */
export function ExamGradingPageContent() {
  const { id } = useParams<{ id: string }>();
  const { allExams, isLoading: examsLoading } = useOnlineExams();
  const activeExam = allExams.find((e) => e.id === id) ?? null;

  const { submissions, isLoading, gradeAnswer, confirm } = useExamSubmissions(activeExam);
  const [selected, setSelected] = useState<string | undefined>();
  const { data: detail } = useExamSubmissionDetail(activeExam?.id, selected);
  const [scores, setScores] = useState<Record<string, string>>({});

  const current = submissions.find((s) => s.id === selected);
  const run = (p: Promise<unknown>, ok: string) => p.then(() => SucessMessage(ok)).catch((e) => ErrorMessage(getApiErrorMessage(e, 'A operação falhou.')));

  if (!activeExam) {
    return examsLoading ? (
      <p className="text-sm text-muted-foreground">A carregar…</p>
    ) : (
      <EmptyState icon="FileX" title="Prova não encontrada" description="A prova pedida não existe ou já não está disponível." />
    );
  }

  return (
    <div className="space-y-6">
      <TitleList
        title={`Mesa de Correcção: ${activeExam.title}`}
        suTitle="Corrija as submissões e lance as notas na mini-pauta."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
        <div className="space-y-2">
          {isLoading && <p className="text-xs text-muted-foreground">A carregar…</p>}
          {!isLoading && submissions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Ainda não há submissões.{activeExam.delivery === 'google_forms' ? ' Use "Google Forms → Importar respostas".' : ''}
            </p>
          )}
          {submissions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s.id)}
              className={`w-full text-left rounded-lg border p-2.5 text-xs transition-colors ${selected === s.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
            >
              <p className="font-medium text-foreground">{s.student?.full_name ?? 'Aluno'}</p>
              <p className="text-muted-foreground mt-0.5">
                {STATUS_LABEL[s.status]} • tentativa {s.attempt_number}
                {s.total_score !== null ? ` • ${s.total_score} pts` : ''}
                {s.source === 'google_forms' ? ' • Google Forms' : ''}
              </p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {!current && <p className="text-xs text-muted-foreground">Escolha uma submissão à esquerda.</p>}
          {current && detail && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{current.student?.full_name}</h3>
                  <p className="text-xs text-muted-foreground">{STATUS_LABEL[detail.status]}</p>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] uppercase text-muted-foreground">Pontuação</span>
                  <span className="text-xl font-extrabold font-mono">{(detail.total_score ?? 0).toFixed(2)} / {activeExam.total_score.toFixed(2)}</span>
                </div>
              </div>

              {detail.answers.map((a, i) => {
                const manual = a.question.question_type === 'dissertativa';
                const value = show(a.value, a.question.options);
                return (
                  <div key={a.question.id} className="rounded-xl border border-border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold">Questão {i + 1} ({a.question.max_score} pts)</span>
                      {manual ? (
                        <Badge variant="warning">Correcção manual</Badge>
                      ) : (
                        <span className={a.score_awarded && a.score_awarded > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                          {a.score_awarded ?? 0} pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground">{a.question.prompt}</p>
                    <div className="rounded-lg bg-muted/40 p-2 text-xs">
                      <span className="block text-[11px] text-muted-foreground mb-0.5">Resposta do aluno</span>
                      {value ?? <span className="italic text-muted-foreground">Sem resposta</span>}
                    </div>
                    {manual && detail.status !== 'confirmada' && a.answer_id && (
                      <div className="flex items-end gap-2">
                        <div className="w-40">
                          <Input
                            label={`Nota (0 a ${a.question.max_score})`}
                            type="quantity"
                            step={0.25}
                            min={0}
                            max={a.question.max_score}
                            value={scores[a.answer_id] ?? String(a.score_awarded ?? '')}
                            onChange={(e) => setScores((cur) => ({ ...cur, [a.answer_id!]: e.target.value }))}
                          />
                        </div>
                        <Button
                          size="sm"
                          disabled={gradeAnswer.isPending || (scores[a.answer_id] ?? '') === ''}
                          onClick={() => run(gradeAnswer.mutateAsync({ submissionId: current.id, answerId: a.answer_id!, score: Math.min(a.question.max_score, Math.max(0, Number(scores[a.answer_id!]))) }), 'Nota gravada.')}
                        >
                          Gravar nota
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-between border-t border-border pt-3">
                {detail.status === 'confirmada' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <Icon name="CheckCheck" className="size-4" />
                    Nota lançada na mini-pauta
                  </span>
                ) : (
                  <Button
                    size="sm"
                    disabled={confirm.isPending || !['corrigida_automaticamente', 'corrigida_manualmente'].includes(detail.status)}
                    onClick={() => run(confirm.mutateAsync(current.id), 'Nota lançada na mini-pauta.')}
                  >
                    <Icon name="FileCheck" className="size-4" />
                    Confirmar e lançar na mini-pauta
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
