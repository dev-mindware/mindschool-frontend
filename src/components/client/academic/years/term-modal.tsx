"use client";

import { useMemo, useState } from "react";
import { FormModal, FormSelect, Input } from "@/components";
import { useYearTerms } from "@/hooks/school/use-academic";
import { isValidIsoDate } from "@/schemas";
import type { ApiAcademicTerm, ApiAcademicYear } from "@/services/academic-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { ErrorMessage, SucessMessage } from "@/utils/messages";

const PERIODIC_EXAM_OWNER_OPTIONS = [
  { value: "professor", label: "Professor" },
  { value: "subdireccao_pedagogica", label: "Subdirecção Pedagógica" },
];

const TERM_TYPE_OPTIONS = [
  { value: "trimestre", label: "Trimestre" },
  { value: "semestre", label: "Semestre" },
];

export function TermFormModal({
  year,
  editing,
  nextSequence,
}: {
  year: ApiAcademicYear | null;
  editing: ApiAcademicTerm | null;
  nextSequence: number;
}) {
  const { open } = useModal();
  if (!open["academic-term-form"] || !year) return null;
  const formKey = editing ? `edit:${editing.id}` : `new:${year.id}:${nextSequence}`;
  return <TermFormBody key={formKey} year={year} editing={editing} nextSequence={nextSequence} />;
}

function TermFormBody({
  year,
  editing,
  nextSequence,
}: {
  year: ApiAcademicYear;
  editing: ApiAcademicTerm | null;
  nextSequence: number;
}) {
  const { createTerm, updateTerm } = useYearTerms(year.id);
  const [type, setType] = useState<"trimestre" | "semestre">(() => editing?.type ?? "trimestre");
  const [sequence, setSequence] = useState(() => editing?.sequence ?? nextSequence);
  const [startDate, setStartDate] = useState(() => editing?.start_date ?? year.start_date);
  const [endDate, setEndDate] = useState(() => editing?.end_date ?? year.end_date);
  const [owner, setOwner] = useState<"professor" | "subdireccao_pedagogica">(
    () => editing?.periodic_exam_owner ?? "professor",
  );
  const [touched, setTouched] = useState(false);

  const errors = useMemo(() => {
    const out: { sequence?: string; start_date?: string; end_date?: string } = {};
    if (!Number.isInteger(sequence) || sequence < 1 || sequence > 3) {
      out.sequence = "A sequência deve ser 1, 2 ou 3.";
    }
    if (!isValidIsoDate(startDate)) {
      out.start_date = "Indique a data de início.";
    } else if (startDate < year.start_date || startDate > year.end_date) {
      out.start_date = `Deve estar dentro do ano (${year.start_date} a ${year.end_date}).`;
    }
    if (!isValidIsoDate(endDate)) {
      out.end_date = "Indique a data de fim.";
    } else if (endDate <= startDate) {
      out.end_date = "O fim deve ser posterior ao início.";
    } else if (endDate > year.end_date) {
      out.end_date = `Não pode ultrapassar o fim do ano (${year.end_date}).`;
    }
    return out;
  }, [sequence, startDate, endDate, year.start_date, year.end_date]);

  const valid = !errors.sequence && !errors.start_date && !errors.end_date;
  const pending = createTerm.isPending || updateTerm.isPending;

  const fail = (e: unknown, fallback: string) => {
    ErrorMessage(getApiErrorMessage(e, fallback));
    throw e;
  };

  return (
    <FormModal
      id="academic-term-form"
      title={editing ? `Editar ${editing.name}` : "Novo período lectivo"}
      description="Defina as datas do trimestre ou semestre e o responsável pela prova periódica."
      submitLabel={editing ? "Guardar período" : "Criar período"}
      isLoading={pending}
      disabled={!valid || pending}
      onSubmit={() => {
        if (!valid) return;
        if (editing) {
          return updateTerm
            .mutateAsync({
              termId: editing.id,
              data: { start_date: startDate, end_date: endDate, periodic_exam_owner: owner },
            })
            .then(() => SucessMessage(`${editing.name} actualizado.`))
            .catch((e) => fail(e, "Não foi possível actualizar o período."));
        }
        return createTerm
          .mutateAsync({
            type,
            sequence,
            start_date: startDate,
            end_date: endDate,
            periodic_exam_owner: owner,
          })
          .then(() => SucessMessage("Período lectivo criado."))
          .catch((e) => fail(e, "Não foi possível criar o período."));
      }}
    >
      <FormSelect
        label="Tipo *"
        value={type}
        onValueChange={(v) => setType(v as "trimestre" | "semestre")}
        options={TERM_TYPE_OPTIONS}
        disabled={Boolean(editing)}
      />
      <Input
        label="Ordem (1 a 3) *"
        type="number"
        min={1}
        max={3}
        value={String(sequence)}
        disabled={Boolean(editing)}
        onChange={(e) => {
          setTouched(true);
          setSequence(Number(e.target.value));
        }}
        error={touched ? errors.sequence : undefined}
      />
      <Input
        label="Início *"
        type="date"
        value={startDate}
        onChange={(e) => {
          setTouched(true);
          setStartDate(e.target.value);
        }}
        error={touched ? errors.start_date : undefined}
      />
      <Input
        label="Fim *"
        type="date"
        value={endDate}
        onChange={(e) => {
          setTouched(true);
          setEndDate(e.target.value);
        }}
        error={touched ? errors.end_date : undefined}
      />
      <div className="sm:col-span-2">
        <FormSelect
          label="Responsável pela prova periódica"
          value={owner}
          onValueChange={(v) => setOwner(v as "professor" | "subdireccao_pedagogica")}
          options={PERIODIC_EXAM_OWNER_OPTIONS}
        />
      </div>
    </FormModal>
  );
}

