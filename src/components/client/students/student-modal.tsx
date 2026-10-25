"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student } from "@/types";
import { useStudents } from "@/hooks/school/use-students";
import { getApiErrorMessage } from "@/utils/api-error";
import { Button, ButtonSubmit } from "@/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  StudentIdentificationFields,
  StudentFormValues,
} from "./student-identification-fields";
import { StudentGuardianFields } from "./student-guardian-fields";
import { validateIdDocumentByType } from "@/schemas/helps";
import { nifError } from "@/lib/nif";
import { useDiscardGuard } from "@/components/common/discard-guard";

const studentFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "O nome deve ter pelo menos 3 caracteres")
      .regex(/^[\p{L}][\p{L}\p{M}' .-]*$/u, "O nome só pode ter letras, espaços, apóstrofo e hífen"),
    gender: z.enum(["MALE", "FEMALE"]),
    birthDate: z
      .string()
      .min(1, "Data de nascimento é obrigatória")
      .refine((v) => !v || v <= new Date().toISOString().slice(0, 10), "A data de nascimento não pode ser futura"),
    idDocumentType: z.enum(["IDENTITY_CARD", "BIRTH_CERTIFICATE", "PASSPORT"]),
    idDocumentNumber: z.string().trim().min(3, "Número de documento é obrigatório"),
    nif: z.string().trim().optional().or(z.literal("")).refine((v) => !nifError(v), { message: nifError("x") }),
    guardianMode: z.enum(["existing", "new"]),
    guardianId: z.string().optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    guardianRelationship: z.string().min(1, "Selecione o grau de parentesco"),
    guardianDocument: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validação estrita do documento do aluno
    const docCheck = validateIdDocumentByType(data.idDocumentNumber, data.idDocumentType);
    if (!docCheck.valid && docCheck.message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["idDocumentNumber"],
        message: docCheck.message,
      });
    }

    if (data.guardianMode === "existing") {
      if (!data.guardianId || data.guardianId.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guardianId"],
          message: "Selecione um encarregado existente",
        });
      }
    } else {
      if (!data.guardianName || data.guardianName.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guardianName"],
          message: "Nome do encarregado é obrigatório",
        });
      }
      if (!data.guardianPhone || data.guardianPhone.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guardianPhone"],
          message: "Contacto deve ter pelo menos 9 dígitos",
        });
      } else {
        const digits = data.guardianPhone.replace(/\D/g, "");
        if (digits.length < 9) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["guardianPhone"],
            message: "Contacto deve ter pelo menos 9 dígitos",
          });
        } else if (!/^(91|92|93|94|95|97|99)\d{7}$/.test(digits) && !digits.startsWith("244")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["guardianPhone"],
            message: "Prefixo inválido para operadoras angolanas (91, 92, 93, 94, 95, 97, 99)",
          });
        }
      }
      if (!data.guardianDocument || data.guardianDocument.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["guardianDocument"],
          message: "Número de documento do encarregado é obrigatório",
        });
      }
    }
  });

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export function StudentModal({
  isOpen,
  onClose,
  studentToEdit,
}: StudentModalProps) {
  const { createStudent, updateStudent } = useStudents();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      gender: "MALE",
      birthDate: "2010-01-01",
      idDocumentType: "IDENTITY_CARD",
      idDocumentNumber: "",
      nif: "",
      guardianMode: "existing",
      guardianId: "",
      guardianName: "",
      guardianPhone: "",
      guardianRelationship: "Pai",
      guardianDocument: "",
    },
  });
  const discard = useDiscardGuard(isDirty, onClose);

  const selectedGender = watch("gender");
  const selectedDocType = watch("idDocumentType");
  const selectedRelationship = watch("guardianRelationship");
  const guardianMode = watch("guardianMode");
  const selectedGuardianId = watch("guardianId");

  useEffect(() => {
    if (studentToEdit) {
      reset({
        fullName: studentToEdit.fullName,
        gender: studentToEdit.gender,
        birthDate: studentToEdit.birthDate,
        idDocumentType: studentToEdit.idDocumentType,
        idDocumentNumber: studentToEdit.idDocumentNumber,
        nif: studentToEdit.nif ?? "",
        guardianMode: studentToEdit.guardianId ? "existing" : "new",
        guardianId: studentToEdit.guardianId || "",
        guardianName: studentToEdit.guardianName || "",
        guardianPhone: studentToEdit.guardianPhone || "",
        guardianRelationship: studentToEdit.guardianRelationship || "Pai",
        guardianDocument: "",
      });
    } else {
      reset({
        fullName: "",
        gender: "MALE",
        birthDate: "2010-01-01",
        idDocumentType: "IDENTITY_CARD",
        idDocumentNumber: "",
        nif: "",
        guardianMode: "existing",
        guardianId: "",
        guardianName: "",
        guardianPhone: "",
        guardianRelationship: "Pai",
        guardianDocument: "",
      });
    }
  }, [studentToEdit, isOpen, reset]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      if (studentToEdit) {
        await updateStudent.mutateAsync({
          id: studentToEdit.id,
          input: {
            fullName: data.fullName,
            gender: data.gender,
            birthDate: data.birthDate,
            idDocumentType: data.idDocumentType,
            idDocumentNumber: data.idDocumentNumber,
            nif: data.nif ?? "",
          },
        });
        SucessMessage("Dados do estudante atualizados com sucesso!");
      } else {
        const payload: Parameters<typeof createStudent.mutateAsync>[0] = {
          fullName: data.fullName,
          gender: data.gender,
          birthDate: data.birthDate,
          idDocumentType: data.idDocumentType,
          idDocumentNumber: data.idDocumentNumber,
          ...(data.nif ? { nif: data.nif } : {}),
          guardianRelationship: data.guardianRelationship,
        };

        if (data.guardianMode === "existing" && data.guardianId) {
          payload.guardianId = data.guardianId;
        } else if (data.guardianName && data.guardianPhone && data.guardianDocument) {
          payload.guardian = {
            name: data.guardianName,
            phone: data.guardianPhone,
            documentNumber: data.guardianDocument,
            relationship: data.guardianRelationship,
          };
        }

        await createStudent.mutateAsync(payload);
        SucessMessage("Novo estudante cadastrado com sucesso!");
      }

      onClose();
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao gravar os dados do estudante."));
    }
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={(open) => !open && discard.request()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-lg font-bold">
            {studentToEdit ? "Editar Estudante" : "Ficha de Registo do Estudante"}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Preencha as informações pessoais, documentos e encarregado de educação
          </SheetDescription>
        </SheetHeader>

        <form id="student-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          <StudentIdentificationFields
            register={register}
            errors={errors}
            selectedGender={selectedGender}
            selectedDocType={selectedDocType}
            setValue={setValue}
            watch={watch}
          />

          <StudentGuardianFields
            register={register}
            errors={errors}
            selectedRelationship={selectedRelationship}
            guardianMode={guardianMode}
            selectedGuardianId={selectedGuardianId}
            setValue={setValue}
            isEditing={Boolean(studentToEdit)}
          />
        </form>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={discard.request}>
            Cancelar
          </Button>
          <ButtonSubmit form="student-form" isLoading={isSubmitting}>
            {studentToEdit ? "Guardar Alterações" : "Cadastrar Estudante"}
          </ButtonSubmit>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    {discard.dialog}
    </>
  );
}
