"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student } from "@/types";
import { useStudents } from "@/hooks/school/use-students";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { Button, ButtonSubmit, Separator } from "@/components";
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
import {
  birthDateSchema,
  fullPersonNameSchema,
  isValidAngolanPhone,
  optionalTaxNumberSchema,
  validateIdDocumentByType,
} from "@/schemas/helps";
import { useDiscardGuard } from "@/components/common/discard-guard";

const buildStudentFormSchema = (isEditing: boolean) =>
  z
    .object({
      fullName: fullPersonNameSchema(5, 200, "O nome completo do estudante"),
      gender: z.enum(["MALE", "FEMALE"]),
      birthDate: birthDateSchema(3, 100),
      idDocumentType: z.enum(["IDENTITY_CARD", "BIRTH_CERTIFICATE", "PASSPORT"]),
      idDocumentNumber: z.string().trim().min(1, "Número de documento é obrigatório"),
      nif: optionalTaxNumberSchema,
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

      if (isEditing) return;

      if (data.guardianMode === "existing") {
        if (!data.guardianId || data.guardianId.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["guardianId"],
            message: "Selecione um encarregado existente",
          });
        }
      } else {
        const gNameCheck = fullPersonNameSchema(5, 200, "O nome completo do encarregado").safeParse(
          data.guardianName ?? ""
        );
        if (!gNameCheck.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["guardianName"],
            message: gNameCheck.error.issues[0]?.message ?? "Nome do encarregado inválido",
          });
        }
        if (!data.guardianPhone || !isValidAngolanPhone(data.guardianPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["guardianPhone"],
            message: "Insira um telemóvel angolano válido (ex: 923 000 000 ou +244 923 000 000)",
          });
        }
        const gDoc = (data.guardianDocument ?? "").trim();
        const gDocValid =
          validateIdDocumentByType(gDoc, "IDENTITY_CARD").valid ||
          validateIdDocumentByType(gDoc, "PASSPORT").valid;
        if (!gDocValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["guardianDocument"],
            message: "Documento do encarregado inválido (BI 9+2+3 ou Passaporte)",
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
    setError,
    trigger,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(buildStudentFormSchema(Boolean(studentToEdit))),
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
      void trigger();
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
      applyApiFieldErrors(err, setError, {
        full_name: "fullName",
        birth_date: "birthDate",
        document_number: "idDocumentNumber",
        nif: "nif",
      });
      ErrorMessage(getApiErrorMessage(err, "Ocorreu um erro ao gravar os dados do estudante."));
    }
  };

  return (
    <>
    <Sheet open={isOpen} onOpenChange={(open) => !open && discard.request()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-lg font-semibold">
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

          <Separator />

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
          <ButtonSubmit form="student-form" isLoading={isSubmitting} disabled={!isValid}>
            {studentToEdit ? "Guardar Alterações" : "Cadastrar Estudante"}
          </ButtonSubmit>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    {discard.dialog}
    </>
  );
}
