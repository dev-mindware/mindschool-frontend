"use client";
import { formatDate } from "@/utils";

import React, { useState } from "react";
import { useAdmissions } from "@/hooks/school/use-admissions";
import {
  GlobalModal,
  Input,
  SelectField,
  Button,
  ButtonSubmit,
  Icon,
} from "@/components";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

interface CandidateApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_LEVEL_OPTIONS = [
  { value: "lvl-inic", label: "Iniciação (Educação Pré-Escolar)" },
  { value: "lvl-1", label: "1ª Classe (Ensino Primário)" },
  { value: "lvl-2", label: "2ª Classe (Ensino Primário)" },
  { value: "lvl-3", label: "3ª Classe (Ensino Primário)" },
  { value: "lvl-4", label: "4ª Classe (Ensino Primário)" },
  { value: "lvl-5", label: "5ª Classe (Ensino Primário)" },
  { value: "lvl-6", label: "6ª Classe (Ensino Primário)" },
  { value: "lvl-7", label: "7ª Classe (I Ciclo Secundário)" },
  { value: "lvl-8", label: "8ª Classe (I Ciclo Secundário)" },
  { value: "lvl-9", label: "9ª Classe (I Ciclo Secundário)" },
  { value: "lvl-10-cfb", label: "10ª Classe - Ciências Físicas e Biológicas" },
  { value: "lvl-10-cej", label: "10ª Classe - Ciências Económicas e Jurídicas" },
  { value: "lvl-10-info", label: "10ª Classe - Técnico de Informática" },
  { value: "lvl-11-cfb", label: "11ª Classe - Ciências Físicas e Biológicas" },
  { value: "lvl-11-info", label: "11ª Classe - Técnico de Informática" },
  { value: "lvl-12-info", label: "12ª Classe - Técnico de Informática" },
];

export function CandidateApplicationModal({
  isOpen,
  onClose,
}: CandidateApplicationModalProps) {
  const { submitApplication, entranceExams } = useAdmissions();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [birthDate, setBirthDate] = useState("2012-01-01");
  const [idDocumentType, setIdDocumentType] = useState<"IDENTITY_CARD" | "BIRTH_CERTIFICATE" | "PASSPORT">("IDENTITY_CARD");
  const [idDocumentNumber, setIdDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("Angolana");
  const [previousSchoolName, setPreviousSchoolName] = useState("");

  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState<"FATHER" | "MOTHER" | "TUTOR" | "OTHER">("FATHER");

  const [desiredClassLevelId, setDesiredClassLevelId] = useState("lvl-7");
  const [desiredShift, setDesiredShift] = useState<"MORNING" | "AFTERNOON" | "EVENING">("MORNING");
  const [requiresEntranceExam, setRequiresEntranceExam] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-toggle entrance exam recommendation when level changes
  const handleLevelChange = (newLevelId: string) => {
    setDesiredClassLevelId(newLevelId);
    // Classes 1-6 normally dispense entrance exams; classes 7+ require it
    if (newLevelId.startsWith("lvl-inic") || ["lvl-1", "lvl-2", "lvl-3", "lvl-4", "lvl-5", "lvl-6"].includes(newLevelId)) {
      setRequiresEntranceExam(false);
      setSelectedExamId("");
    } else {
      setRequiresEntranceExam(true);
      const matchingExam = entranceExams.find((e) => e.classLevelId === newLevelId);
      if (matchingExam) {
        setSelectedExamId(matchingExam.id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 3) {
      ErrorMessage("Por favor, preencha o nome completo do candidato.");
      return;
    }
    if (!idDocumentNumber.trim()) {
      ErrorMessage("Por favor, informe o número do documento de identificação.");
      return;
    }
    if (!guardianName.trim()) {
      ErrorMessage("Por favor, informe o nome do encarregado de educação.");
      return;
    }
    if (!guardianPhone.trim()) {
      ErrorMessage("Por favor, informe o telefone do encarregado.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedLevel = CLASS_LEVEL_OPTIONS.find((c) => c.value === desiredClassLevelId);
      const chosenExam = entranceExams.find((e) => e.id === selectedExamId);

      await submitApplication(
        {
          fullName: fullName.trim(),
          gender,
          birthDate,
          idDocumentType,
          idDocumentNumber: idDocumentNumber.trim().toUpperCase(),
          nationality,
          guardianName: guardianName.trim(),
          guardianPhone: guardianPhone.trim(),
          guardianEmail: guardianEmail.trim() || undefined,
          guardianRelationship,
          previousSchoolName: previousSchoolName.trim() || undefined,
        },
        {
          desiredClassLevelId,
          desiredClassLevelName: selectedLevel?.label || "7ª Classe",
          desiredShift,
          requiresEntranceExam,
          entranceExamId: requiresEntranceExam ? (chosenExam?.id || undefined) : undefined,
          entranceExamTitle: requiresEntranceExam ? (chosenExam?.title || "Exame Curricular") : undefined,
        }
      );

      SucessMessage("Candidatura de admissão registada com sucesso!");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao submeter candidatura";
      ErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="GraduationCap" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Nova Candidatura de Admissão (UC-00)
            </h3>
            <p className="text-xs text-muted-foreground">
              Registo de pré-inscrição do candidato com dados do encarregado e pretensão escolar
            </p>
          </div>
        </div>
      }
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {/* Secção 1: Dados do Candidato */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b">
            <Icon name="User" className="h-4 w-4 text-primary" />
            1. Dados Pessoais do Candidato (Pré-Aluno)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome Completo do Candidato"
                placeholder="Ex: Kiara Luísa Gaspar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <SelectField
              label="Género"
              value={gender}
              onValueChange={(val) => setGender(val as "MALE" | "FEMALE")}
              options={[
                { value: "MALE", label: "Masculino" },
                { value: "FEMALE", label: "Feminino" },
              ]}
            />

            <Input
              label="Data de Nascimento"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />

            <SelectField
              label="Tipo de Documento"
              value={idDocumentType}
              onValueChange={(val) =>
                setIdDocumentType(
                  val as "IDENTITY_CARD" | "BIRTH_CERTIFICATE" | "PASSPORT"
                )
              }
              options={[
                { value: "IDENTITY_CARD", label: "Bilhete de Identidade (BI)" },
                { value: "BIRTH_CERTIFICATE", label: "Cédula / Assento de Nascimento" },
                { value: "PASSPORT", label: "Passaporte" },
              ]}
            />

            <Input
              label="Número do Documento"
              placeholder="Ex: 008432190LA045"
              value={idDocumentNumber}
              onChange={(e) => setIdDocumentNumber(e.target.value)}
              required
            />

            <Input
              label="Nacionalidade"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
            />

            <Input
              label="Escola Anterior / Origem"
              placeholder="Ex: Complexo Escolar n.º 1024"
              value={previousSchoolName}
              onChange={(e) => setPreviousSchoolName(e.target.value)}
            />
          </div>
        </div>

        {/* Secção 2: Encarregado de Educação */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b">
            <Icon name="Users" className="h-4 w-4 text-primary" />
            2. Encarregado de Educação Responsável
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nome do Encarregado de Educação"
                placeholder="Ex: Gaspar António Gaspar"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Telefone Principal (WhatsApp)"
              placeholder="+244 923 000 000"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              required
            />

            <Input
              label="E-mail (Opcional)"
              type="email"
              placeholder="encarregado@exemplo.com"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
            />

            <SelectField
              label="Grau de Parentesco"
              value={guardianRelationship}
              onValueChange={(val) =>
                setGuardianRelationship(
                  val as "FATHER" | "MOTHER" | "TUTOR" | "OTHER"
                )
              }
              options={[
                { value: "FATHER", label: "Pai" },
                { value: "MOTHER", label: "Mãe" },
                { value: "TUTOR", label: "Tutor Legal" },
                { value: "OTHER", label: "Outro Familiar" },
              ]}
            />
          </div>
        </div>

        {/* Secção 3: Pretensão Escolar & Prova de Acesso */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b">
            <Icon name="BookOpen" className="h-4 w-4 text-primary" />
            3. Pretensão Escolar & Avaliação de Acesso
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <SelectField
                label="Classe / Nível Pretendido"
                value={desiredClassLevelId}
                onValueChange={(val) => handleLevelChange(val)}
                options={CLASS_LEVEL_OPTIONS}
              />
            </div>

            <SelectField
              label="Turno Pretendido"
              value={desiredShift}
              onValueChange={(val) =>
                setDesiredShift(val as "MORNING" | "AFTERNOON" | "EVENING")
              }
              options={[
                { value: "MORNING", label: "Manhã" },
                { value: "AFTERNOON", label: "Tarde" },
                { value: "EVENING", label: "Noite" },
              ]}
            />

            <div className="flex flex-col justify-center space-y-2 p-3 rounded-lg border bg-muted/30">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={requiresEntranceExam}
                  onChange={(e) => setRequiresEntranceExam(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                Exige Prova de Acesso para esta Inscrição
              </label>
              <p className="text-xs text-muted-foreground">
                {requiresEntranceExam
                  ? "O candidato realizará o exame curricular antes da decisão de admissão."
                  : "Isento de exame. A admissão dependerá exclusivamente de vagas e documentos."}
              </p>
            </div>

            {requiresEntranceExam && (
              <div className="sm:col-span-2">
                <SelectField
                  label="Convocatória / Prova de Acesso Associada"
                  value={selectedExamId}
                  onValueChange={(val) => setSelectedExamId(val)}
                  options={[
                    { value: "", label: "A definir posteriormente pela Direção" },
                    ...entranceExams.map((exam) => ({
                      value: exam.id,
                      label: `${exam.title} (${formatDate(exam.examDate)})`,
                    })),
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com botões de ação */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <ButtonSubmit isLoading={isSubmitting} className="gap-2">
            <Icon name="Check" className="h-4 w-4" />
            Submeter Candidatura
          </ButtonSubmit>
        </div>
      </form>
    </GlobalModal>
  );
}
