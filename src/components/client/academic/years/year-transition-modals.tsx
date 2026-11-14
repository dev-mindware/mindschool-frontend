"use client";

import { useMemo, useState } from "react";
import { Checkbox, FormModal, FormSelect, FormTextarea, Input, Label } from "@/components";
import { useAcademicYears } from "@/hooks/school/use-academic";
import { isValidIsoDate, safeTextSchema } from "@/schemas";
import type { ApiAcademicYear } from "@/services/academic-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

type ActiveRegime = "presencial" | "hibrido" | "remoto";

const REGIME_OPTIONS = [
  { value: "presencial", label: "Presencial" },
  { value: "hibrido", label: "Híbrido (presencial + remoto)" },
  { value: "remoto", label: "Remoto (ensino à distância)" },
];

const reasonSchema = safeTextSchema(5, 500, "O motivo");

function showYearFail(err: unknown, fallback: string) {
  ErrorMessage(getApiErrorMessage(err, fallback));
  throw err;
}

const defaultActiveRegime = (target: ApiAcademicYear | null): ActiveRegime =>
  target?.delivery_mode && target.delivery_mode !== "pausa" ? target.delivery_mode : "presencial";

function useReasonField(required = true) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const error = useMemo(() => {
    if (!required && !reason.trim()) return undefined;
    const res = reasonSchema.safeParse(reason);
    return res.success ? undefined : res.error.issues[0]?.message;
  }, [required, reason]);

  const trimmed = reason.trim();
  const valid = !required || (trimmed.length >= 5 && !error);

  return {
    reason,
    trimmed,
    error: touched ? error : undefined,
    valid,
    onChange: (value: string) => {
      setTouched(true);
      setReason(value);
    },
  };
}

function RegimeReasonFields({
  regimeLabel,
  regime,
  onRegimeChange,
  reasonLabel,
  reasonPlaceholder,
  field,
}: {
  regimeLabel: string;
  regime: ActiveRegime;
  onRegimeChange: (value: ActiveRegime) => void;
  reasonLabel: string;
  reasonPlaceholder: string;
  field: ReturnType<typeof useReasonField>;
}) {
  return (
    <>
      <div className="sm:col-span-2">
        <FormSelect
          label={regimeLabel}
          value={regime}
          onValueChange={(v) => onRegimeChange(v as ActiveRegime)}
          options={REGIME_OPTIONS}
        />
      </div>
      <FormTextarea
        label={reasonLabel}
        placeholder={reasonPlaceholder}
        value={field.reason}
        onChange={field.onChange}
        error={field.error}
        rows={3}
      />
    </>
  );
}

export function RegimeModal({ target }: { target: ApiAcademicYear | null }) {
  const { open } = useModal();
  if (!open["academic-year-regime"] || !target) return null;
  return <RegimeModalBody key={`regime:${target.id}:${target.delivery_mode}`} target={target} />;
}

function RegimeModalBody({ target }: { target: ApiAcademicYear }) {
  const { changeRegime } = useAcademicYears();
  const [regime, setRegime] = useState<ActiveRegime>(() => defaultActiveRegime(target));
  const field = useReasonField(true);

  return (
    <FormModal
      id="academic-year-regime"
      title={`Alterar regime — ${target.name}`}
      description="Registe a transição entre ensino presencial, híbrido ou remoto (ex.: obras numa ala, redução de lotação ou directiva sanitária)."
      submitLabel="Aplicar regime"
      isLoading={changeRegime.isPending}
      disabled={!field.valid || changeRegime.isPending}
      onSubmit={() => {
        if (!field.valid) return;
        return changeRegime
          .mutateAsync({ id: target.id, regime, reason: field.trimmed })
          .then(() => SucessMessage("Regime de ensino actualizado."))
          .catch((e) => showYearFail(e, "Não foi possível alterar o regime de ensino."));
      }}
    >
      <RegimeReasonFields
        regimeLabel="Novo regime de ensino *"
        regime={regime}
        onRegimeChange={setRegime}
        reasonLabel="Motivo da alteração * (mín. 5 caracteres)"
        reasonPlaceholder="Ex.: Despacho n.º 18/26 — funcionamento em regime híbrido por obras de reabilitação..."
        field={field}
      />
    </FormModal>
  );
}

export function SuspendYearModal({ target }: { target: ApiAcademicYear | null }) {
  const { open } = useModal();
  if (!open["academic-year-suspend"] || !target) return null;
  return <SuspendYearModalBody key={`suspend:${target.id}`} target={target} />;
}

function SuspendYearModalBody({ target }: { target: ApiAcademicYear }) {
  const { suspendYear } = useAcademicYears();
  const field = useReasonField(true);
  const [createEvent, setCreateEvent] = useState(true);
  const [eventEndDate, setEventEndDate] = useState("");

  const endDateError = useMemo(() => {
    if (!createEvent || !eventEndDate.trim()) return undefined;
    if (!isValidIsoDate(eventEndDate)) return "Indique uma data válida (AAAA-MM-DD).";
    if (eventEndDate > target.end_date) {
      return `A data não pode ultrapassar o fim do ano (${target.end_date}).`;
    }
    return undefined;
  }, [createEvent, eventEndDate, target.end_date]);

  const valid = field.valid && !endDateError;

  return (
    <FormModal
      id="academic-year-suspend"
      title={`Suspender ano lectivo ${target.name}`}
      description="Interrompe temporariamente as actividades lectivas por calamidade, decreto sanitário, greve prolongada ou força maior."
      submitLabel="Confirmar suspensão"
      isLoading={suspendYear.isPending}
      disabled={!valid || suspendYear.isPending}
      onSubmit={() => {
        if (!valid) return;
        return suspendYear
          .mutateAsync({
            id: target.id,
            reason: field.trimmed,
            create_calendar_event: createEvent,
            event_end_date: createEvent && eventEndDate.trim() ? eventEndDate.trim() : undefined,
          })
          .then(() => SucessMessage(`Ano lectivo ${target.name} suspenso.`))
          .catch((e) => showYearFail(e, "Não foi possível suspender o ano lectivo."));
      }}
    >
      <div className="sm:col-span-2 rounded-xs border border-amber-500/40 bg-amber-500/10 p-3 text-xs space-y-1">
        <p className="font-semibold text-foreground">Impacto operacional imediato</p>
        <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
          <li>Novos lançamentos de aulas, sumários, chamadas e avaliações ficam bloqueados.</li>
          <li>Aulas futuras previstas passam a canceladas e os dias do motor ficam marcados como não lectivos.</li>
          <li>Matrículas, gestão financeira, calendário e emissão de documentos continuam disponíveis.</li>
        </ul>
      </div>

      <FormTextarea
        label="Motivo oficial da suspensão * (mín. 5 caracteres)"
        placeholder="Ex.: Decreto presidencial de emergência sanitária / intempérie na província..."
        value={field.reason}
        onChange={field.onChange}
        error={field.error}
        rows={3}
      />

      <div className="sm:col-span-2 flex items-start gap-2.5 rounded-xs border border-border/60 p-3">
        <Checkbox
          id="suspend-create-cal-event"
          checked={createEvent}
          onCheckedChange={(v) => setCreateEvent(Boolean(v))}
          className="mt-0.5"
        />
        <div className="space-y-0.5">
          <Label htmlFor="suspend-create-cal-event" className="cursor-pointer font-medium">
            Registar evento «Suspensão das Aulas» no Calendário Escolar
          </Label>
          <p className="text-xs text-muted-foreground">
            Cria automaticamente um evento não lectivo publicado para visibilidade de professores e encarregados.
          </p>
        </div>
      </div>

      {createEvent && (
        <div className="sm:col-span-2">
          <Input
            label="Previsão de fim da suspensão (opcional)"
            type="date"
            value={eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
            error={endDateError}
          />
        </div>
      )}
    </FormModal>
  );
}

export function ResumeYearModal({ target }: { target: ApiAcademicYear | null }) {
  const { open } = useModal();
  if (!open["academic-year-resume"] || !target) return null;
  return <ResumeYearModalBody key={`resume:${target.id}:${target.end_date}`} target={target} />;
}

function ResumeYearModalBody({ target }: { target: ApiAcademicYear }) {
  const { resumeYear } = useAcademicYears();
  const [regime, setRegime] = useState<ActiveRegime>("presencial");
  const field = useReasonField(true);
  const [newEndDate, setNewEndDate] = useState(() => target.end_date);

  const endDateError = useMemo(() => {
    const val = newEndDate.trim();
    if (!val || val === target.end_date) return undefined;
    if (!isValidIsoDate(val)) return "Indique uma data válida (AAAA-MM-DD).";
    if (val < target.end_date) {
      return `A nova data não pode ser anterior ao fim actual (${target.end_date}).`;
    }
    return undefined;
  }, [newEndDate, target.end_date]);

  return (
    <FormModal
      id="academic-year-resume"
      title={`Retomar ano lectivo ${target.name}`}
      description="Reactiva as aulas e operações lectivas. Se o evento de suspensão ainda decorrer, será encerrado na data anterior à retoma."
      submitLabel="Retomar ano lectivo"
      isLoading={resumeYear.isPending}
      disabled={!field.valid || Boolean(endDateError) || resumeYear.isPending}
      onSubmit={() => {
        if (!field.valid || endDateError) return;
        const trimmedEnd = newEndDate.trim();
        const sendEndDate = trimmedEnd && trimmedEnd !== target.end_date ? trimmedEnd : undefined;
        return resumeYear
          .mutateAsync({
            id: target.id,
            regime,
            reason: field.trimmed,
            new_end_date: sendEndDate,
          })
          .then(() => SucessMessage(`Ano lectivo ${target.name} retomado.`))
          .catch((e) => showYearFail(e, "Não foi possível retomar o ano lectivo."));
      }}
    >
      <FormSelect
        label="Regime de retoma *"
        value={regime}
        onValueChange={(v) => setRegime(v as ActiveRegime)}
        options={REGIME_OPTIONS}
      />
      <Input
        label="Estender fim do ano para reposição (opcional)"
        type="date"
        value={newEndDate}
        onChange={(e) => setNewEndDate(e.target.value)}
        error={endDateError}
      />
      <FormTextarea
        label="Despacho / motivo da retoma * (mín. 5 caracteres)"
        placeholder="Ex.: Autorização de retoma presencial com calendário de reposição aprovado..."
        value={field.reason}
        onChange={field.onChange}
        error={field.error}
        rows={3}
      />
    </FormModal>
  );
}

export function CloseYearModal({ target }: { target: ApiAcademicYear | null }) {
  const { open } = useModal();
  if (!open["academic-year-close"] || !target) return null;
  return <CloseYearModalBody key={`close:${target.id}:${target.status}`} target={target} />;
}

function CloseYearModalBody({ target }: { target: ApiAcademicYear }) {
  const { closeYear } = useAcademicYears();
  const requiresReason = target.status === "suspenso";
  const field = useReasonField(requiresReason);

  return (
    <FormModal
      id="academic-year-close"
      title={`Encerrar ano lectivo ${target.name}`}
      description="Fecha formalmente o ano lectivo e impede novos registos de aulas, presenças e notas."
      submitLabel="Encerrar ano lectivo"
      isLoading={closeYear.isPending}
      disabled={!field.valid || Boolean(field.error) || closeYear.isPending}
      onSubmit={() => {
        if (!field.valid || field.error) return;
        return closeYear
          .mutateAsync({ id: target.id, reason: field.trimmed || undefined })
          .then(() => SucessMessage(`Ano lectivo ${target.name} encerrado.`))
          .catch((e) => showYearFail(e, "Não foi possível encerrar o ano lectivo."));
      }}
    >
      <FormTextarea
        label={
          requiresReason
            ? "Justificação do encerramento durante suspensão * (mín. 5 caracteres)"
            : "Observação de encerramento (opcional)"
        }
        placeholder="Ex.: Conclusão das pautas finais e conselhos de notas / encerramento administrativo..."
        value={field.reason}
        onChange={field.onChange}
        error={field.error}
        rows={3}
      />
    </FormModal>
  );
}

export function ReopenYearModal({ target }: { target: ApiAcademicYear | null }) {
  const { open } = useModal();
  if (!open["academic-year-reopen"] || !target) return null;
  return <ReopenYearModalBody key={`reopen:${target.id}`} target={target} />;
}

function ReopenYearModalBody({ target }: { target: ApiAcademicYear }) {
  const { reopenYear } = useAcademicYears();
  const [regime, setRegime] = useState<ActiveRegime>(() => defaultActiveRegime(target));
  const field = useReasonField(true);

  return (
    <FormModal
      id="academic-year-reopen"
      title={`Reabrir ano lectivo ${target.name}`}
      description="Reabre um ano previamente encerrado para correcções excepcionais. Só é permitido se não existir outro ano activo ou suspenso."
      submitLabel="Reabrir ano lectivo"
      isLoading={reopenYear.isPending}
      disabled={!field.valid || reopenYear.isPending}
      onSubmit={() => {
        if (!field.valid) return;
        return reopenYear
          .mutateAsync({ id: target.id, regime, reason: field.trimmed })
          .then(() => SucessMessage(`Ano lectivo ${target.name} reaberto.`))
          .catch((e) => showYearFail(e, "Não foi possível reabrir o ano lectivo."));
      }}
    >
      <RegimeReasonFields
        regimeLabel="Regime ao reabrir *"
        regime={regime}
        onRegimeChange={setRegime}
        reasonLabel="Motivo da reabertura * (mín. 5 caracteres)"
        reasonPlaceholder="Ex.: Rectificação excepcional de pautas e lançamento de exame extraordinário..."
        field={field}
      />
    </FormModal>
  );
}

