"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Button, EmptyState, FormModal, FormTextarea, Input } from "@/components";
import { useHealth, usePsychoCase } from "@/hooks/school/use-health";
import { CASE_CATEGORY_LABEL, CASE_STATUS_LABEL } from "@/services/health-service";
import { getApiErrorMessage } from "@/utils/api-error";
import { pastOrTodayIsoDateSchema, safeTextSchema, todayLocalIsoDate } from "@/schemas";

const sessionSchema = z.object({
  date: pastOrTodayIsoDateSchema("A data da sessão"),
  notes: safeTextSchema(5, 2000, "As notas da sessão"),
});

/** Detalhe do caso: resumo, sessões registadas, nova sessão e encerramento. */
export function PsychopedagogicalPlanCard({ caseId }: { caseId: string | null }) {
  const { data, addSession, setStatus } = usePsychoCase(caseId ?? undefined);
  const { nameOf } = useHealth();
  const [date, setDate] = useState(todayLocalIsoDate);
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState({ date: false, notes: false });
  const closed = data?.status === "encerrado";
  const err = (e: unknown) => ErrorMessage(getApiErrorMessage(e, "A operação falhou."));

  const parsed = useMemo(() => sessionSchema.safeParse({ date, notes }), [date, notes]);
  const issueFor = (field: "date" | "notes") =>
    !parsed.success ? parsed.error.issues.find((i) => i.path[0] === field)?.message : undefined;
  const dateError = touched.date ? issueFor("date") : undefined;
  const notesError = touched.notes ? issueFor("notes") : undefined;

  return (
    <FormModal id="health-case" title={data ? (nameOf.get(data.student_id) ?? "Caso") : "Caso"} description={data ? `${CASE_CATEGORY_LABEL[data.category]} • ${CASE_STATUS_LABEL[data.status]}` : undefined} size="lg" readOnly onSubmit={() => undefined}>
      {data && (
        <div className="sm:col-span-2 space-y-4 text-sm">
          <p className="rounded-xs border p-3">{data.summary}</p>
          <div className="space-y-2">
            <h4 className="font-semibold">Sessões ({data.sessions.length})</h4>
            {data.sessions.length === 0 && (
              <EmptyState
                icon="CalendarOff"
                title="Ainda sem sessões"
                description="Registe a primeira sessão no formulário abaixo."
                className="py-4 my-2"
              />
            )}
            {data.sessions.map((s) => (<div key={s.id} className="rounded-xs border p-2"><p className="font-mono text-xs text-muted-foreground">{s.session_date}</p><p>{s.notes}</p></div>))}
          </div>
          {!closed && (
            <div className="space-y-3 border-t pt-3">
              <Input
                label="Data da sessão *"
                type="date"
                max={todayLocalIsoDate()}
                value={date}
                error={dateError}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTouched((t) => ({ ...t, date: true }));
                }}
              />
              <FormTextarea
                label="Notas da sessão (confidenciais) *"
                value={notes}
                onChange={(v) => {
                  setNotes(v);
                  setTouched((t) => ({ ...t, notes: true }));
                }}
                rows={3}
                maxLength={2000}
                error={notesError}
                placeholder="Anotações confidenciais sobre a evolução da sessão com o aluno..."
              />
              <div className="flex justify-between">
                <Button
                  size="sm"
                  disabled={!parsed.success || addSession.isPending}
                  onClick={() => {
                    if (!parsed.success) {
                      setTouched({ date: true, notes: true });
                      return;
                    }
                    void addSession
                      .mutateAsync({ date: parsed.data.date, notes: parsed.data.notes })
                      .then(() => {
                        SucessMessage("Sessão registada.");
                        setNotes("");
                        setTouched({ date: false, notes: false });
                      })
                      .catch(err);
                  }}
                >
                  Registar sessão
                </Button>
                <Button size="sm" variant="outline" disabled={setStatus.isPending} onClick={() => setStatus.mutateAsync("encerrado").then(() => SucessMessage("Caso encerrado.")).catch(err)}>Encerrar caso</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </FormModal>
  );
}
