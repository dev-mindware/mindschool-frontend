"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ConfirmModal, EmptyState, Icon } from "@/components";
import { portalService, type AnswerValue, type ExamQuestion, type ExamSession } from "@/modules/family/services/portal-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const CONFIRM = "exam-submit";
const BACK = "/familia/provas";
const clock = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const isAnswered = (v: AnswerValue | undefined) => (Array.isArray(v) ? v.length > 0 : typeof v === "boolean" ? true : typeof v === "string" ? v.trim().length > 0 : false);
const sameAnswer = (a: AnswerValue | undefined, b: AnswerValue | undefined) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const TYPE_LABEL: Record<ExamQuestion["question_type"], string> = {
  escolha_multipla_unica: "Escolha uma opção", escolha_multipla_varias: "Escolha uma ou mais opções", verdadeiro_falso: "Verdadeiro ou falso", resposta_curta: "Resposta curta", dissertativa: "Resposta desenvolvida",
};

function AnswerInput({ q, value, onChange, disabled }: { q: ExamQuestion; value: AnswerValue | undefined; onChange: (v: AnswerValue) => void; disabled: boolean }) {
  const base = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-70";
  if (q.question_type === "escolha_multipla_unica" || q.question_type === "escolha_multipla_varias") {
    const multi = q.question_type === "escolha_multipla_varias";
    const chosen = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];
    return (
      <div className="space-y-2">
        {(q.options ?? []).map((o) => {
          const on = chosen.includes(o.id);
          return (
            <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${on ? "border-primary bg-primary/5" : ""} ${disabled ? "cursor-default" : "hover:bg-muted/40"}`}>
              <input type={multi ? "checkbox" : "radio"} name={q.id} className="mt-0.5 accent-[var(--primary)]" checked={on} disabled={disabled}
                onChange={() => onChange(multi ? (on ? chosen.filter((x) => x !== o.id) : [...chosen, o.id]) : o.id)} />
              <span>{o.text}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (q.question_type === "verdadeiro_falso") {
    return (
      <div className="flex gap-2">
        {[{ v: true, label: "Verdadeiro" }, { v: false, label: "Falso" }].map((o) => (
          <button key={o.label} type="button" disabled={disabled} onClick={() => onChange(o.v)}
            className={`rounded-lg border px-4 py-2 text-sm ${value === o.v ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted/40"}`}>{o.label}</button>
        ))}
      </div>
    );
  }
  if (q.question_type === "resposta_curta") return <input className={base} value={typeof value === "string" ? value : ""} disabled={disabled} maxLength={255} onChange={(e) => onChange(e.target.value)} placeholder="Escreva a resposta" />;
  return <textarea className={`${base} min-h-32`} value={typeof value === "string" ? value : ""} disabled={disabled} maxLength={10000} onChange={(e) => onChange(e.target.value)} placeholder="Escreva a sua resposta" />;
}

/** Realização da prova online: temporizador, gravação automática de cada resposta, envio com confirmação e resultado. */
export function ExamTaker({ examId, submissionId }: { examId: string; submissionId?: string }) {
  const { openModal } = useModal();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [left, setLeft] = useState(0);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [sending, setSending] = useState(false);
  const saved = useRef<Record<string, AnswerValue>>({});
  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; });
  const endsAt = useRef(0);
  const started = useRef(false);
  const inProgress = session?.submission.status === "em_curso";

  const hydrate = useCallback((s: ExamSession) => {
    const initial: Record<string, AnswerValue> = {};
    for (const q of s.questions) if (q.answer !== null && q.answer !== "") initial[q.id] = q.answer;
    saved.current = { ...initial };
    setAnswers(initial);
    endsAt.current = Date.now() + s.seconds_left * 1000;
    setLeft(s.seconds_left);
    setSession(s);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const load = submissionId ? portalService.examSession(examId, submissionId) : portalService.startExam(examId);
    load.then(hydrate).catch((e) => setError(getApiErrorMessage(e, "Não foi possível abrir a prova.")));
  }, [examId, submissionId, hydrate]);

  const flush = useCallback(async () => {
    if (!session) return true;
    const dirty = Object.entries(answersRef.current).filter(([id, v]) => !sameAnswer(saved.current[id], v));
    if (dirty.length === 0) return true;
    setSaving("saving");
    try {
      await portalService.saveExamAnswers(examId, session.submission.id, dirty.map(([question_id, value]) => ({ question_id, value })));
      for (const [id, v] of dirty) saved.current[id] = v;
      setSaving("saved");
      return true;
    } catch (e) {
      setSaving("error");
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a resposta. Verifique a ligação."));
      return false;
    }
  }, [examId, session]);

  // gravacao automatica (debounce) enquanto a prova decorre
  useEffect(() => {
    if (!inProgress) return;
    const t = setTimeout(() => void flush(), 800);
    return () => clearTimeout(t);
  }, [answers, inProgress, flush]);

  const submit = useCallback(async () => {
    if (!session || sending) return;
    setSending(true);
    try {
      await flush();
      await portalService.submitExam(examId, session.submission.id);
      SucessMessage("Prova enviada.");
      hydrate(await portalService.examSession(examId, session.submission.id));
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível enviar a prova."));
    } finally {
      setSending(false);
    }
  }, [examId, flush, hydrate, session, sending]);

  // temporizador: ao chegar a zero envia automaticamente
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; });
  useEffect(() => {
    if (!inProgress) return;
    const t = setInterval(() => {
      const s = Math.max(0, Math.round((endsAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) { clearInterval(t); void submitRef.current(); }
    }, 1000);
    return () => clearInterval(t);
  }, [inProgress]);

  // aviso ao fechar a janela com a prova a decorrer
  useEffect(() => {
    if (!inProgress) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [inProgress]);

  const answeredCount = useMemo(() => (session?.questions ?? []).filter((q) => isAnswered(answers[q.id])).length, [session, answers]);

  if (error) return <EmptyState icon="TriangleAlert" title="Não é possível realizar a prova" description={error}><Button asChild variant="outline"><Link href={BACK}>Voltar às provas</Link></Button></EmptyState>;
  if (!session) return <p className="text-sm text-muted-foreground">A abrir a prova…</p>;

  const total = session.questions.length;
  const result = session.result;
  const urgent = left <= 300;

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 backdrop-blur">
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="outline">Tentativa {session.submission.attempt_number}</Badge>
          <span className="text-muted-foreground">{answeredCount}/{total} respondidas</span>
          {inProgress && <span className="text-xs text-muted-foreground">{saving === "saving" ? "A guardar…" : saving === "saved" ? "Guardado" : saving === "error" ? "Erro ao guardar" : ""}</span>}
        </div>
        {inProgress ? (
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 font-mono text-lg font-semibold ${urgent ? "text-destructive" : ""}`}><Icon name="Timer" className="size-4" />{clock(left)}</span>
            <Button disabled={sending} onClick={() => openModal(CONFIRM)}>Enviar prova</Button>
          </div>
        ) : <Button asChild variant="outline" size="sm"><Link href={BACK}>Voltar às provas</Link></Button>}
      </div>

      {result && (
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Resultado da prova</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{result.total_score.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">/ {result.max_score.toFixed(1)}</span></p>
          <p className="mt-2 text-xs text-muted-foreground">
            {result.confirmed ? "Nota confirmada pelo professor; a correção está visível abaixo." : result.pending_manual ? "Nota provisória: há respostas desenvolvidas por corrigir. A correção aparece quando o professor confirmar." : "Nota provisória: aguarda a confirmação do professor."}
          </p>
        </div>
      )}

      <ol className="space-y-4">
        {session.questions.map((q, i) => (
          <li key={q.id} className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Pergunta {i + 1} • {TYPE_LABEL[q.question_type]} • {q.max_score} {q.max_score === 1 ? "ponto" : "pontos"}</p>
                <p className="mt-1 whitespace-pre-line font-medium">{q.prompt}</p>
              </div>
              {!inProgress && q.score_awarded !== undefined && <Badge variant={q.score_awarded === null ? "secondary" : q.score_awarded >= q.max_score ? "success" : q.score_awarded > 0 ? "warning" : "destructive"} className="shrink-0 font-normal">{q.score_awarded === null ? "Por corrigir" : `${q.score_awarded}/${q.max_score}`}</Badge>}
            </div>
            <AnswerInput q={q} value={answers[q.id]} disabled={!inProgress} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
            {!inProgress && q.expected_answer && <p className="text-xs text-muted-foreground">Resposta certa: <span className="font-medium text-foreground">{q.expected_answer}</span></p>}
          </li>
        ))}
      </ol>

      <ConfirmModal id={CONFIRM} title="Enviar a prova?" description={answeredCount < total ? `Faltam ${total - answeredCount} pergunta(s) sem resposta. Depois de enviada, a prova não pode ser alterada.` : "Depois de enviada, a prova não pode ser alterada."} confirmLabel="Enviar prova" onConfirm={() => submit()} />
    </div>
  );
}
