"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Guardian,
  PreferredContactChannel,
  GuardianRelationship,
  GuardianWard,
} from "@/types";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  Badge,
  Icon,
  PaginatedSelect,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

const guardianFormSchema = z.object({
  fullName: z.string().trim().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  idDocumentNumber: z.string().trim().optional().or(z.literal("")),
  phonePrimary: z.string().trim().min(9, "Contacto deve ter pelo menos 9 dígitos"),
  phoneSecondary: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Email inválido").or(z.literal("")).optional(),
  address: z.string().trim().optional().or(z.literal("")),
  profession: z.string().trim().optional().or(z.literal("")),
  workplace: z.string().trim().optional().or(z.literal("")),
  preferredContactChannel: z.enum(["WHATSAPP", "SMS", "EMAIL", "PHONE_CALL"]),
});

type GuardianFormValues = z.infer<typeof guardianFormSchema>;

interface GuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  guardianToEdit?: Guardian | null;
}

const RELATIONSHIP_OPTIONS = [
  { value: "FATHER", label: "Pai" },
  { value: "MOTHER", label: "Mãe" },
  { value: "UNCLE", label: "Tio(a)" },
  { value: "GRANDPARENT", label: "Avô/Avó" },
  { value: "LEGAL_GUARDIAN", label: "Tutor(a) Legal" },
  { value: "TUTOR", label: "Encarregado Indicado" },
  { value: "OTHER", label: "Outro" },
];

const RELATIONSHIP_LABELS: Record<string, string> = {
  FATHER: "Pai",
  MOTHER: "Mãe",
  UNCLE: "Tio(a)",
  GRANDPARENT: "Avô/Avó",
  LEGAL_GUARDIAN: "Tutor(a) Legal",
  TUTOR: "Encarregado Indicado",
  OTHER: "Outro",
};

const CHANNEL_OPTIONS = [
  { value: "WHATSAPP", label: "WhatsApp (Preferencial em Angola)" },
  { value: "SMS", label: "Mensagem SMS" },
  { value: "EMAIL", label: "Correio Electrónico (E-mail)" },
  { value: "PHONE_CALL", label: "Chamada Telefónica de Voz" },
];

export function GuardianModal({
  isOpen,
  onClose,
  guardianToEdit,
}: GuardianModalProps) {
  const { addGuardian, updateGuardian, students } = useSchoolDataStore();

  // Wards collection state
  const [wards, setWards] = useState<GuardianWard[]>([]);

  // Candidate ward state
  const [candidateStudentId, setCandidateStudentId] = useState<string>("");
  const [candidateRelationship, setCandidateRelationship] =
    useState<string>("FATHER");

  // Paginated search for candidate student
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const PAGE_SIZE = 5;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      idDocumentNumber: "",
      phonePrimary: "",
      phoneSecondary: "",
      email: "",
      address: "Luanda",
      profession: "",
      workplace: "",
      preferredContactChannel: "WHATSAPP",
    },
  });

  const selectedChannel = watch("preferredContactChannel");

  useEffect(() => {
    if (guardianToEdit) {
      reset({
        fullName: guardianToEdit.fullName,
        idDocumentNumber: guardianToEdit.idDocumentNumber || "",
        phonePrimary: guardianToEdit.phonePrimary,
        phoneSecondary: guardianToEdit.phoneSecondary || "",
        email: guardianToEdit.email || "",
        address: guardianToEdit.address || "",
        profession: guardianToEdit.profession || "",
        workplace: guardianToEdit.workplace || "",
        preferredContactChannel: guardianToEdit.preferredContactChannel,
      });
      // Load ALL wards of the guardian
      setWards(guardianToEdit.wards ? [...guardianToEdit.wards] : []);
    } else {
      reset({
        fullName: "",
        idDocumentNumber: "",
        phonePrimary: "",
        phoneSecondary: "",
        email: "",
        address: "Luanda",
        profession: "",
        workplace: "",
        preferredContactChannel: "WHATSAPP",
      });
      setWards([]);
    }
    setCandidateStudentId("");
    setCandidateRelationship("FATHER");
    setStudentSearch("");
    setStudentPage(1);
  }, [guardianToEdit, isOpen, reset]);

  // Paginated students filtering
  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentNumber.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  const pagedStudents = useMemo(() => {
    const start = (studentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, studentPage]);

  // Prepare options for PaginatedSelect
  const studentOptions = useMemo(() => {
    const opts = pagedStudents.map((s) => ({
      value: s.id,
      label: s.fullName,
      description: `${s.studentNumber} • ${s.currentClassLevel || "Sem Turma"}`,
    }));

    // If candidateStudentId is selected but not on current page, ensure it's in options
    if (
      candidateStudentId &&
      !opts.some((o) => o.value === candidateStudentId)
    ) {
      const activeStudent = students.find((s) => s.id === candidateStudentId);
      if (activeStudent) {
        opts.unshift({
          value: activeStudent.id,
          label: activeStudent.fullName,
          description: `${activeStudent.studentNumber} • ${
            activeStudent.currentClassLevel || "Sem Turma"
          }`,
        });
      }
    }

    return opts;
  }, [pagedStudents, candidateStudentId, students]);

  const handleStudentSearch = (val: string) => {
    setStudentSearch(val);
    setStudentPage(1);
  };

  const handleAddWard = () => {
    if (!candidateStudentId) return;

    const studentToAdd = students.find((s) => s.id === candidateStudentId);
    if (!studentToAdd) return;

    // Check if already in wards
    if (wards.some((w) => w.studentId === candidateStudentId)) {
      ErrorMessage("Este aluno já se encontra vinculado a este encarregado.");
      return;
    }

    const newWard: GuardianWard = {
      studentId: studentToAdd.id,
      studentName: studentToAdd.fullName,
      relationship: candidateRelationship as GuardianRelationship,
      isPrimaryContact: wards.length === 0,
    };

    setWards((prev) => [...prev, newWard]);
    setCandidateStudentId("");
    SucessMessage(`Aluno ${studentToAdd.fullName} adicionado aos educandos.`);
  };

  const handleRemoveWard = (studentId: string) => {
    setWards((prev) => prev.filter((w) => w.studentId !== studentId));
  };

  const onSubmit = async (data: GuardianFormValues) => {
    try {
      if (guardianToEdit) {
        updateGuardian(guardianToEdit.id, {
          fullName: data.fullName,
          idDocumentNumber: data.idDocumentNumber || undefined,
          phonePrimary: data.phonePrimary,
          phoneSecondary: data.phoneSecondary || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          profession: data.profession || undefined,
          workplace: data.workplace || undefined,
          preferredContactChannel: data.preferredContactChannel,
          wards,
        });
        SucessMessage("Dados do encarregado atualizados com sucesso!");
      } else {
        addGuardian({
          schoolId: "dev-school-1",
          fullName: data.fullName,
          idDocumentType: "BI",
          idDocumentNumber: data.idDocumentNumber || undefined,
          phonePrimary: data.phonePrimary,
          phoneSecondary: data.phoneSecondary || undefined,
          email: data.email || undefined,
          address: data.address || undefined,
          profession: data.profession || undefined,
          workplace: data.workplace || undefined,
          preferredContactChannel: data.preferredContactChannel,
          wards,
        });
        SucessMessage("Novo encarregado cadastrado com sucesso!");
      }

      onClose();
    } catch (err: any) {
      ErrorMessage(err?.message || "Ocorreu um erro ao guardar o encarregado.");
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={guardianToEdit ? "Editar Encarregado de Educação" : "Registar Encarregado de Educação"}
      description="Gerencie os dados cadastrais, contactos e a lista de todos os educandos a cargo"
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
        {/* Secção 1: Dados Pessoais */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            1. Dados Pessoais & Identificação
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome Completo *"
                startIcon="User"
                placeholder="Ex: João Baptista Afonso"
                {...register("fullName")}
                error={errors.fullName?.message}
              />
            </div>

            <Input
              label="Número do BI / Documento"
              startIcon="CreditCard"
              placeholder="Ex: 001928374LA038"
              {...register("idDocumentNumber")}
              error={errors.idDocumentNumber?.message}
            />

            <Input
              label="Profissão / Ocupação"
              startIcon="Briefcase"
              placeholder="Ex: Engenheiro Civil"
              {...register("profession")}
              error={errors.profession?.message}
            />

            <div className="sm:col-span-2">
              <Input
                label="Local de Trabalho"
                startIcon="Building2"
                placeholder="Ex: Ministério dos Transportes, Luanda"
                {...register("workplace")}
                error={errors.workplace?.message}
              />
            </div>
          </div>
        </div>

        {/* Secção 2: Contactos e Notificações */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            2. Contactos & Notificações
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Telefone Principal (WhatsApp) *"
              startIcon="Phone"
              placeholder="9xxxxxxxx"
              maxLength={9}
              {...register("phonePrimary")}
              error={errors.phonePrimary?.message}
            />

            <Input
              label="Telefone Alternativo"
              startIcon="Phone"
              placeholder="9xxxxxxxx"
              maxLength={9}
              {...register("phoneSecondary")}
              error={errors.phoneSecondary?.message}
            />

            <Input
              type="email"
              label="Endereço de E-mail"
              startIcon="Mail"
              placeholder="exemplo@dominio.ao"
              {...register("email")}
              error={errors.email?.message}
            />

            <SelectField
              label="Canal Preferencial de Aviso *"
              value={selectedChannel}
              options={CHANNEL_OPTIONS}
              onValueChange={(val) =>
                setValue("preferredContactChannel", val as PreferredContactChannel)
              }
            />

            <div className="sm:col-span-2">
              <Input
                label="Morada / Bairro de Residência"
                startIcon="MapPin"
                placeholder="Ex: Maianga, Rua Amílcar Cabral, Luanda"
                {...register("address")}
                error={errors.address?.message}
              />
            </div>
          </div>
        </div>

        {/* Secção 3: Gestão de Educandos (Wards) com PaginatedSelect */}
        <div className="space-y-3 p-4 rounded-xl border bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="GraduationCap" className="h-4 w-4 text-primary" />
                3. Educandos a Cargo ({wards.length})
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Todos os alunos aos quais este encarregado responde
              </p>
            </div>
            {wards.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {wards.length} educando(s) associado(s)
              </Badge>
            )}
          </div>

          {/* Lista de Educandos Existentes */}
          {wards.length > 0 ? (
            <div className="space-y-2 pt-1">
              {wards.map((ward) => (
                <div
                  key={ward.studentId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Icon name="User" className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {ward.studentName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[11px] font-normal">
                          {RELATIONSHIP_LABELS[ward.relationship] || ward.relationship}
                        </Badge>
                        {ward.isPrimaryContact && (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full font-medium">
                            Contacto Principal
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWard(ward.studentId)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    title="Remover educando"
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 text-center border border-dashed rounded-lg text-xs text-muted-foreground">
              Nenhum educando associado. Adicione educandos usando o seletor abaixo.
            </div>
          )}

          {/* Bloco para Adicionar Novo Educando com PaginatedSelect */}
          <div className="pt-3 border-t space-y-3">
            <span className="text-xs font-semibold text-foreground block">
              Vincular Aluno da Escola
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <PaginatedSelect
                  label="Pesquisar Estudante (com paginação)"
                  value={candidateStudentId}
                  onChange={(val) => setCandidateStudentId(val)}
                  placeholder="Selecione ou pesquise o aluno..."
                  searchPlaceholder="Pesquise por nome ou nº processo..."
                  searchValue={studentSearch}
                  onSearchChange={handleStudentSearch}
                  pagination={{ page: studentPage, totalPages }}
                  onPageChange={setStudentPage}
                  options={studentOptions}
                  fullWidth
                />
              </div>

              <div>
                <SelectField
                  label="Grau de Parentesco"
                  value={candidateRelationship}
                  options={RELATIONSHIP_OPTIONS}
                  onValueChange={setCandidateRelationship}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!candidateStudentId}
                onClick={handleAddWard}
                className="gap-1.5"
              >
                <Icon name="Plus" className="h-4 w-4" />
                Adicionar aos Educandos
              </Button>
            </div>
          </div>
        </div>

        {/* Botões de Ação no Padrão MindGest */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="w-max">
            {guardianToEdit ? "Guardar Alterações" : "Cadastrar Encarregado"}
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
