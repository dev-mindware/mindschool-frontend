"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { FormModal, FormSelect, FormTextarea, Input } from "@/components";
import { useStudents } from "@/hooks/school/use-students";
import { useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { REQUEST_TYPE_LABEL, type ApiRequest, type RequestType } from "@/services/secretary-requests-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { optionalSafeTextSchema, safeTextSchema } from "@/schemas";

const newRequestSchema = z.object({
  studentId: z.string().optional(),
  type: z.enum(
    [
      "declaracao_matricula",
      "declaracao_notas",
      "certificado",
      "segunda_via_cartao",
      "transferencia",
      "outro",
    ],
    { error: "Seleccione o serviço solicitado." }
  ),
  subject: safeTextSchema(3, 150, "O assunto / finalidade"),
  description: optionalSafeTextSchema(500, 2, "As observações"),
});

type NewRequestInput = z.input<typeof newRequestSchema>;
type NewRequestFormData = z.infer<typeof newRequestSchema>;

export function NewRequestModal({ onSuccess }: { onSuccess?: (r: ApiRequest) => void }) {
  const { create } = useSecretaryRequests();
  const { students } = useStudents("");
  const { openModal } = useModal();

  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewRequestInput, unknown, NewRequestFormData>({
    resolver: zodResolver(newRequestSchema),
    mode: "onChange",
    defaultValues: {
      studentId: "",
      type: "declaracao_matricula",
      subject: "",
      description: "",
    },
  });

  const studentId = watch("studentId") ?? "";
  const type = watch("type");
  const description = watch("description") ?? "";

  const submit = (data: NewRequestFormData) =>
    create
      .mutateAsync({
        type: data.type,
        subject: data.subject || REQUEST_TYPE_LABEL[data.type],
        description: data.description || undefined,
        studentId: data.studentId || undefined,
      })
      .then((req) => {
        SucessMessage(`Requerimento aberto. Protocolo: ${req.protocol}`);
        reset();
        onSuccess?.(req);
        setTimeout(() => openModal("request-slip"), 150);
      })
      .catch((err) => {
        applyApiFieldErrors(err, setError);
        ErrorMessage(getApiErrorMessage(err, "Não foi possível abrir o requerimento."));
        throw err;
      });

  return (
    <FormModal
      id="request-new"
      title="Novo requerimento"
      description="O requerimento recebe um número de protocolo e um comprovativo imprimível."
      submitLabel="Abrir requerimento"
      isLoading={create.isPending}
      disabled={!isValid || create.isPending}
      onClose={() => reset()}
      onSubmit={handleSubmit(submit)}
    >
      <div className="sm:col-span-2">
        <StudentSelect
          label="Aluno (opcional)"
          students={students}
          value={studentId}
          error={errors.studentId?.message}
          onChange={(val) =>
            setValue("studentId", val, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true,
            })
          }
        />
      </div>
      <div className="sm:col-span-2">
        <FormSelect
          label="Serviço solicitado *"
          value={type}
          error={errors.type?.message}
          onValueChange={(v) =>
            setValue("type", v as RequestType, {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true,
            })
          }
          options={(Object.keys(REQUEST_TYPE_LABEL) as RequestType[]).map((t) => ({
            value: t,
            label: REQUEST_TYPE_LABEL[t],
          }))}
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          label="Assunto / finalidade *"
          placeholder="Ex: para abertura de conta bancária"
          maxLength={150}
          error={errors.subject?.message}
          {...register("subject")}
        />
      </div>
      <FormTextarea
        label="Observações"
        value={description}
        maxLength={500}
        error={errors.description?.message}
        onChange={(val) =>
          setValue("description", val, {
            shouldValidate: true,
            shouldTouch: true,
            shouldDirty: true,
          })
        }
        rows={3}
        placeholder="Informações adicionais ou notas para a secretaria..."
      />
    </FormModal>
  );
}
