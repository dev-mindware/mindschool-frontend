"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Student, StudentGender, IdDocumentType } from "@/types";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const studentFormSchema = z.object({
  fullName: z.string().trim().min(3, "O nome deve ter pelo menos 3 caracteres"),
  gender: z.enum(["MALE", "FEMALE"]),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  idDocumentType: z.enum(["IDENTITY_CARD", "BIRTH_CERTIFICATE", "PASSPORT"]),
  idDocumentNumber: z.string().trim().min(3, "Número de documento é obrigatório"),
  address: z.string().trim().min(2, "Endereço é obrigatório"),
  city: z.string().trim().min(1, "Cidade é obrigatória"),
  province: z.string().trim().min(1, "Província é obrigatória"),
  sectionId: z.string().min(1, "Selecione a turma"),
  guardianName: z.string().trim().min(3, "Nome do encarregado é obrigatório"),
  guardianPhone: z.string().trim().min(9, "Contacto deve ter pelo menos 9 dígitos"),
  guardianRelationship: z.string().min(1, "Selecione o grau de parentesco"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

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
  const { addStudent, updateStudent, sections } = useSchoolDataStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      gender: "MALE",
      birthDate: "2010-01-01",
      idDocumentType: "IDENTITY_CARD",
      idDocumentNumber: "",
      address: "Luanda, Angola",
      city: "Luanda",
      province: "Luanda",
      sectionId: sections[0]?.id || "",
      guardianName: "",
      guardianPhone: "",
      guardianRelationship: "Pai",
    },
  });

  const selectedGender = watch("gender");
  const selectedDocType = watch("idDocumentType");
  const selectedSectionId = watch("sectionId");
  const selectedRelationship = watch("guardianRelationship");

  useEffect(() => {
    if (studentToEdit) {
      reset({
        fullName: studentToEdit.fullName,
        gender: studentToEdit.gender,
        birthDate: studentToEdit.birthDate,
        idDocumentType: studentToEdit.idDocumentType,
        idDocumentNumber: studentToEdit.idDocumentNumber,
        address: studentToEdit.address,
        city: studentToEdit.city,
        province: studentToEdit.province,
        sectionId: studentToEdit.currentSectionId,
        guardianName: studentToEdit.guardianName,
        guardianPhone: studentToEdit.guardianPhone,
        guardianRelationship: studentToEdit.guardianRelationship,
      });
    } else {
      reset({
        fullName: "",
        gender: "MALE",
        birthDate: "2010-01-01",
        idDocumentType: "IDENTITY_CARD",
        idDocumentNumber: "",
        address: "Luanda, Angola",
        city: "Luanda",
        province: "Luanda",
        sectionId: sections[0]?.id || "",
        guardianName: "",
        guardianPhone: "",
        guardianRelationship: "Pai",
      });
    }
  }, [studentToEdit, isOpen, sections, reset]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      const targetSection = sections.find((s) => s.id === data.sectionId);
      const sectionName = targetSection ? targetSection.name : "";
      const classLevel = targetSection ? targetSection.classLevel : "";

      if (studentToEdit) {
        updateStudent(studentToEdit.id, {
          fullName: data.fullName,
          gender: data.gender,
          birthDate: data.birthDate,
          idDocumentType: data.idDocumentType,
          idDocumentNumber: data.idDocumentNumber,
          address: data.address,
          city: data.city,
          province: data.province,
          currentSectionId: data.sectionId,
          currentSectionName: sectionName,
          currentClassLevel: classLevel,
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          guardianRelationship: data.guardianRelationship,
        });
        SucessMessage("Dados do estudante atualizados com sucesso!");
      } else {
        const studentNumber = `MS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        addStudent({
          schoolId: "dev-school-1",
          studentNumber,
          fullName: data.fullName,
          gender: data.gender,
          birthDate: data.birthDate,
          idDocumentType: data.idDocumentType,
          idDocumentNumber: data.idDocumentNumber,
          nationality: "Angolana",
          address: data.address,
          city: data.city,
          province: data.province,
          status: "ENROLLED",
          guardianId: "grd-1",
          guardianName: data.guardianName,
          guardianPhone: data.guardianPhone,
          guardianRelationship: data.guardianRelationship,
          currentSectionId: data.sectionId,
          currentSectionName: sectionName,
          currentClassLevel: classLevel,
          academicYear: "2025/2026",
        });
        SucessMessage("Novo estudante cadastrado com sucesso!");
      }

      onClose();
    } catch (err: any) {
      ErrorMessage(err?.message || "Ocorreu um erro ao gravar os dados do estudante.");
    }
  };

  const sectionOptions = sections.map((sec) => ({
    value: sec.id,
    label: `${sec.name} (${sec.shift === "MORNING" ? "Manhã" : "Tarde"})`,
  }));

  const genderOptions = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Feminino" },
  ];

  const docTypeOptions = [
    { value: "IDENTITY_CARD", label: "Bilhete de Identidade (BI)" },
    { value: "BIRTH_CERTIFICATE", label: "Cédula / Assento de Nascimento" },
    { value: "PASSPORT", label: "Passaporte" },
  ];

  const relationshipOptions = [
    { value: "Pai", label: "Pai" },
    { value: "Mãe", label: "Mãe" },
    { value: "Tio/Tia", label: "Tio(a)" },
    { value: "Avô/Avó", label: "Avô(ó)" },
    { value: "Tutor Legal", label: "Tutor Legal" },
    { value: "Outro", label: "Outro" },
  ];

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={studentToEdit ? "Editar Estudante" : "Ficha de Registo do Estudante"}
      description="Preencha as informações pessoais, documentos e encarregado de educação"
      className="!max-h-[85vh] !w-full sm:!max-w-2xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
        {/* Secção 1: Identificação Pessoal */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            1. Identificação do Aluno
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome Completo do Estudante *"
                startIcon="User"
                placeholder="Ex: Manuel António da Silva"
                {...register("fullName")}
                error={errors.fullName?.message}
              />
            </div>

            <SelectField
              label="Género *"
              value={selectedGender}
              options={genderOptions}
              onValueChange={(val) => setValue("gender", val as StudentGender)}
            />

            <Input
              type="date"
              label="Data de Nascimento *"
              startIcon="Calendar"
              {...register("birthDate")}
              error={errors.birthDate?.message}
            />

            <SelectField
              label="Tipo de Documento *"
              value={selectedDocType}
              options={docTypeOptions}
              onValueChange={(val) => setValue("idDocumentType", val as IdDocumentType)}
            />

            <Input
              label="Número do Documento *"
              startIcon="CreditCard"
              placeholder="Ex: 007849302LA042"
              {...register("idDocumentNumber")}
              error={errors.idDocumentNumber?.message}
            />
          </div>
        </div>

        {/* Secção 2: Localização e Turma */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            2. Localização & Matrícula
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Endereço de Residência *"
                startIcon="MapPin"
                placeholder="Ex: Bairro Maculusso, Rua 3, Casa 45"
                {...register("address")}
                error={errors.address?.message}
              />
            </div>

            <Input
              label="Município / Cidade"
              startIcon="Building2"
              placeholder="Luanda"
              {...register("city")}
              error={errors.city?.message}
            />

            <SelectField
              label="Turma de Ingresso *"
              value={selectedSectionId}
              options={sectionOptions}
              placeholder="Selecione a turma..."
              onValueChange={(val) => setValue("sectionId", val)}
            />
          </div>
        </div>

        {/* Secção 3: Encarregado de Educação */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            3. Encarregado de Educação
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <Input
                label="Nome do Encarregado *"
                startIcon="User"
                placeholder="Ex: Domingos da Silva"
                {...register("guardianName")}
                error={errors.guardianName?.message}
              />
            </div>

            <Input
              label="Telefone Principal *"
              startIcon="Phone"
              placeholder="9xxxxxxxx"
              maxLength={9}
              {...register("guardianPhone")}
              error={errors.guardianPhone?.message}
            />

            <div className="sm:col-span-2">
              <SelectField
                label="Grau de Parentesco *"
                value={selectedRelationship}
                options={relationshipOptions}
                onValueChange={(val) => setValue("guardianRelationship", val)}
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação no Padrão MindGest */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
            {studentToEdit ? "Guardar Alterações" : "Cadastrar Estudante"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
