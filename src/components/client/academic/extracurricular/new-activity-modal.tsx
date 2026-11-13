"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Button,
  ButtonSubmit,
  FormSelect,
  FormTextarea,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components";
import { useExtracurricular } from "@/hooks/school/use-extracurricular";
import { WEEKDAYS } from "@/services/extracurricular-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { optionalSafeTextSchema, quantitySchema, safeTextSchema, timeHHMMSchema } from "@/schemas";

const MODAL_ID = "activity-new";

const newActivitySchema = z
  .object({
    name: safeTextSchema(2, 120, "O nome da atividade"),
    description: optionalSafeTextSchema(1000, 3, "A descrição da actividade"),
    teacherId: z.string().trim().optional(),
    weekday: z.string().trim(),
    start: z
      .string()
      .trim()
      .refine((v) => v === "" || timeHHMMSchema("A hora de início").safeParse(v).success, "Hora inválida (HH:MM).")
      .optional(),
    end: z
      .string()
      .trim()
      .refine((v) => v === "" || timeHHMMSchema("A hora de fim").safeParse(v).success, "Hora inválida (HH:MM).")
      .optional(),
    location: optionalSafeTextSchema(150, 2, "O local da actividade"),
    capacity: quantitySchema(1, 250, "A lotação"),
  })
  .superRefine((data, ctx) => {
    if (data.start && data.end && data.start >= data.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end"],
        message: "A hora de fim deve ser posterior à hora de início.",
      });
    }
  });

type NewActivityInput = z.input<typeof newActivitySchema>;
type NewActivityData = z.infer<typeof newActivitySchema>;

const EMPTY: NewActivityInput = {
  name: "",
  description: "",
  teacherId: "",
  weekday: "0",
  start: "",
  end: "",
  location: "",
  capacity: 20,
};

export function NewActivityModal() {
  const { open, closeModal } = useModal();
  const { create, teachers, hasActiveYear } = useExtracurricular();
  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewActivityInput, unknown, NewActivityData>({
    resolver: zodResolver(newActivitySchema),
    mode: "onChange",
    defaultValues: EMPTY,
  });

  const description = watch("description") ?? "";
  const teacherId = watch("teacherId") || "none";
  const weekday = watch("weekday");
  const capacity = watch("capacity");

  const handleClose = () => {
    reset(EMPTY);
    closeModal(MODAL_ID);
  };

  const onSubmit = (f: NewActivityData) => {
    create
      .mutateAsync({
        name: f.name,
        description: f.description || undefined,
        teacherId: f.teacherId || undefined,
        weekday: Number(f.weekday) || undefined,
        startTime: f.start || undefined,
        endTime: f.end || undefined,
        location: f.location || undefined,
        capacity: f.capacity,
      })
      .then(() => {
        SucessMessage("Atividade criada.");
        reset(EMPTY);
        closeModal(MODAL_ID);
      })
      .catch((err) => {
        applyApiFieldErrors(err, setError);
        ErrorMessage(getApiErrorMessage(err, "Não foi possível criar a atividade."));
      });
  };

  return (
    <Sheet open={Boolean(open[MODAL_ID])} onOpenChange={(next) => !next && handleClose()}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
        <SheetHeader className="p-0">
          <SheetTitle>Nova atividade</SheetTitle>
          <SheetDescription>
            {hasActiveYear
              ? "Clubes, desporto ou outras atividades fora do currículo."
              : "Não há ano letivo ativo; crie-o primeiro."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Nome *"
                startIcon="Trophy"
                maxLength={120}
                placeholder="Ex: Clube de Xadrez"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>
            <div className="sm:col-span-2">
              <FormTextarea
                label="Descrição da actividade"
                placeholder="Descreva os objectivos, dinâmica e plano geral do clube ou actividade..."
                value={description}
                onChange={(v) => setValue("description", v, { shouldValidate: true, shouldTouch: true })}
                rows={2}
                maxLength={1000}
                error={errors.description?.message}
              />
            </div>
            <FormSelect
              label="Responsável"
              value={teacherId}
              onValueChange={(v) => setValue("teacherId", v === "none" ? "" : v, { shouldValidate: true })}
              options={[{ value: "none", label: "Sem responsável" }, ...teachers.map((t) => ({ value: t.id, label: t.full_name }))]}
              error={errors.teacherId?.message}
            />
            <Input
              label="Lotação *"
              type="quantity"
              min={1}
              max={250}
              step={1}
              placeholder="Ex.: 25"
              value={capacity === undefined || capacity === null ? "" : String(capacity)}
              error={errors.capacity?.message}
              onChange={(e) => setValue("capacity", e.target.value, { shouldValidate: true, shouldTouch: true })}
            />
            <FormSelect
              label="Dia da semana"
              value={weekday}
              onValueChange={(v) => setValue("weekday", v, { shouldValidate: true })}
              options={[{ value: "0", label: "Sem horário fixo" }, ...WEEKDAYS.slice(1).map((d, i) => ({ value: String(i + 1), label: d }))]}
              error={errors.weekday?.message}
            />
            <Input
              label="Início"
              type="time"
              error={errors.start?.message}
              {...register("start", {
                onChange: () => {
                  void setValue("end", watch("end"), { shouldValidate: true });
                },
              })}
            />
            <Input
              label="Fim"
              type="time"
              error={errors.end?.message}
              {...register("end")}
            />
            <div className="sm:col-span-2">
              <Input
                label="Local da actividade"
                startIcon="MapPin"
                maxLength={150}
                placeholder="Ex.: Campo Polidesportivo / Sala de Música"
                error={errors.location?.message}
                {...register("location")}
              />
            </div>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <ButtonSubmit isLoading={create.isPending} disabled={!hasActiveYear || !isValid || create.isPending}>
              Criar atividade
            </ButtonSubmit>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
