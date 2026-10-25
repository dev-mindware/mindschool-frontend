'use client';

import React, { useState } from 'react';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { GlobalModal, Button, Badge, FormSelect, Icon } from '@/components';
import { useGoogleForm } from '@/hooks/school/use-online-exams';
import { SKIP_REASON, type ApiExam, type ApiFormSync } from '@/services/exams-service';
import { getApiErrorMessage } from '@/utils/api-error';

interface GoogleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: ApiExam | null;
}

/** Realizar a prova num Google Form da escola: criar, partilhar a ligação, importar respostas (correcção automática) e desligar. */
export function GoogleFormModal({ isOpen, onClose, activeExam }: GoogleFormModalProps) {
  const { status, isLoading, googleConnected, formsScopeGranted, link, sync, unlink, connect } = useGoogleForm(isOpen ? activeExam?.id : undefined);
  const [emailMode, setEmailMode] = useState<'verified' | 'responder_input'>('verified');
  const [result, setResult] = useState<ApiFormSync | null>(null);

  const run = (p: Promise<unknown>, ok: string) => p.then(() => SucessMessage(ok)).catch((e) => ErrorMessage(getApiErrorMessage(e, 'A operação falhou.')));

  const importResponses = () =>
    sync.mutateAsync().then((r) => {
      setResult(r);
      SucessMessage(r.imported > 0 ? `${r.imported} resposta(s) importada(s).` : 'Sem respostas novas.');
    }).catch((e) => ErrorMessage(getApiErrorMessage(e, 'Não foi possível importar as respostas.')));

  const reconnect = () =>
    connect.mutateAsync().then((url) => { window.location.href = url; }).catch((e) => ErrorMessage(getApiErrorMessage(e, 'Não foi possível iniciar a ligação ao Google.')));

  const ready = googleConnected && formsScopeGranted;

  return (
    <GlobalModal isOpen={isOpen} onClose={onClose} title={activeExam ? `Google Forms: ${activeExam.title}` : 'Google Forms'} className="!w-[95vw] sm:!max-w-2xl">
      {activeExam && (
        <div className="space-y-4 text-sm">
          {isLoading && <p className="text-xs text-muted-foreground">A carregar…</p>}

          {!isLoading && !status?.linked && (
            <>
              <p className="text-xs text-muted-foreground">
                A plataforma cria um formulário do Google (modo quiz) com as {activeExam.questions.length} questões desta prova. Os alunos respondem no Google; depois as respostas são
                importadas, identificadas pelo e-mail da conta, corrigidas automaticamente e a nota segue para a mini-pauta após a sua confirmação.
              </p>
              {!ready && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-2">
                  <p>
                    {!googleConnected
                      ? 'A escola ainda não ligou a conta Google.'
                      : 'A ligação Google da escola foi feita antes desta funcionalidade e não inclui a permissão do Google Forms.'}{' '}
                    A Direção/Titular tem de ligar (ou voltar a ligar) a conta Google da escola.
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={reconnect} disabled={connect.isPending}>
                    Ligar conta Google
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-medium">Identificação do aluno</label>
                <div className="w-72"><FormSelect label="" value={emailMode} onValueChange={(v) => setEmailMode(v as 'verified' | 'responder_input')} options={[{ value: 'verified', label: 'E-mail verificado (Google) — recomendado' }, { value: 'responder_input', label: 'E-mail escrito pelo aluno' }]} /></div>
                <Button size="sm" className="gap-1.5" disabled={link.isPending || activeExam.questions.length === 0} onClick={() => run(link.mutateAsync(emailMode), 'Google Form criado.')}>
                  <Icon name="Link" className="size-4" />
                  Criar Google Form
                </Button>
              </div>
              {activeExam.questions.length === 0 && <p className="text-xs text-rose-600">Adicione questões antes de criar o formulário.</p>}
            </>
          )}

          {status?.linked && (
            <>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs space-y-1.5">
                <p className="font-semibold text-emerald-800">Formulário ligado</p>
                <p>
                  Ligação para os alunos:{' '}
                  <a href={status.responder_url ?? '#'} target="_blank" rel="noreferrer" className="underline break-all">{status.responder_url}</a>
                </p>
                {status.edit_url && (
                  <p>
                    Editar no Google: <a href={status.edit_url} target="_blank" rel="noreferrer" className="underline">abrir</a>
                  </p>
                )}
                <p className="text-muted-foreground">
                  {status.imported_responses ?? 0} resposta(s) importada(s){status.synced_at ? ` • última importação ${new Date(status.synced_at).toLocaleString('pt-AO')}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="gap-1.5" disabled={sync.isPending} onClick={importResponses}>
                  <Icon name="Download" className="size-4" />
                  Importar respostas
                </Button>
                <Button size="sm" variant="outline" disabled={unlink.isPending} onClick={() => run(unlink.mutateAsync(), 'Formulário desligado.')}>
                  Desligar
                </Button>
              </div>
            </>
          )}

          {result && (
            <div className="rounded-lg border border-border p-3 text-xs space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{result.total_responses} no Google</Badge>
                <Badge variant="default">{result.imported} importadas</Badge>
                <Badge variant="secondary">{result.already_imported} já importadas</Badge>
                <Badge variant="warning">{result.manual_pending} por corrigir (dissertativas)</Badge>
              </div>
              {result.skipped.length > 0 && (
                <ul className="space-y-1 text-muted-foreground">
                  {result.skipped.map((s) => (
                    <li key={s.response_id}>
                      • {s.email ?? 'sem e-mail'} — {SKIP_REASON[s.reason] ?? s.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </GlobalModal>
  );
}
