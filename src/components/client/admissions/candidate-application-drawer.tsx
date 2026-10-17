"use client";

import React, { useState, useMemo, useEffect } from "react";
import { formatDate, formatIdDocument, formatPhone, cleanIdDocument, cleanPhone } from "@/utils";
import { validateIdDocumentByType } from "@/schemas/helps";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { useAdmissionSessions } from "@/hooks/school/use-phase6";
import { useGuardians } from "@/hooks/school/use-guardians";
import {
  Input,
  SelectField,
  Icon,
  FileUpload,
  PROOF_ACCEPT,
} from "@/components";
import { PassportPhotoCropper, type PassportPhotoValue } from "./passport-photo-cropper";
import type { ApplicationDocuments } from "@/services/admissions-service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ButtonSubmit } from "@/components/ui/button-submit";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { cn } from "@/lib/utils";

interface CandidateApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ---- Estrutura Canónica do Sistema de Ensino de Angola (MED) -------------------------------------------

export interface EducationCycle {
  id: string;
  name: string;
  classes: { id: string; name: string }[];
}

export const EDUCATION_CYCLES: EducationCycle[] = [
  {
    id: "pre-escolar",
    name: "Educação Pré-Escolar",
    classes: [
      { id: "lvl-inic", name: "Iniciação" },
    ],
  },
  {
    id: "primario",
    name: "Ensino Primário",
    classes: [
      { id: "lvl-1", name: "1ª Classe" },
      { id: "lvl-2", name: "2ª Classe" },
      { id: "lvl-3", name: "3ª Classe" },
      { id: "lvl-4", name: "4ª Classe" },
      { id: "lvl-5", name: "5ª Classe" },
      { id: "lvl-6", name: "6ª Classe" },
    ],
  },
  {
    id: "i-ciclo",
    name: "I Ciclo do Ensino Secundário",
    classes: [
      { id: "lvl-7", name: "7ª Classe" },
      { id: "lvl-8", name: "8ª Classe" },
      { id: "lvl-9", name: "9ª Classe" },
    ],
  },
  {
    id: "ii-ciclo",
    name: "II Ciclo do Ensino Secundário (Geral e Técnico)",
    classes: [
      { id: "lvl-10-cfb", name: "10ª Classe - Ciências Físicas e Biológicas" },
      { id: "lvl-10-cej", name: "10ª Classe - Ciências Económicas e Jurídicas" },
      { id: "lvl-10-info", name: "10ª Classe - Técnico de Informática" },
      { id: "lvl-11-cfb", name: "11ª Classe - Ciências Físicas e Biológicas" },
      { id: "lvl-11-info", name: "11ª Classe - Técnico de Informática" },
      { id: "lvl-12-info", name: "12ª Classe - Técnico de Informática" },
    ],
  },
];

export function CandidateApplicationDrawer({
  isOpen,
  onClose,
}: CandidateApplicationDrawerProps) {
  const { submitApplication, entranceExams } = useAdmissions();
  const { sessions: phase6Sessions = [] } = useAdmissionSessions();
  const { allGuardians, isLoading: isLoadingGuardians } = useGuardians();

  // 1. Dados Pessoais do Candidato
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [birthDate, setBirthDate] = useState("2012-01-01");
  const [idDocumentType, setIdDocumentType] = useState<
    "IDENTITY_CARD" | "BIRTH_CERTIFICATE" | "PASSPORT"
  >("IDENTITY_CARD");
  const [idDocumentNumber, setIdDocumentNumber] = useState("");
  const [nationality, setNationality] = useState("Angolana");
  const [previousSchoolName, setPreviousSchoolName] = useState("");

  // 2. Encarregado de Educação
  const [guardianMode, setGuardianMode] = useState<"existing" | "new">("existing");
  const [selectedGuardianId, setSelectedGuardianId] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState<
    "FATHER" | "MOTHER" | "TUTOR" | "OTHER"
  >("FATHER");

  // 3. Pretensão Escolar: 2 selects separados (Ciclo + Classe)
  const [selectedCycleId, setSelectedCycleId] = useState("i-ciclo");
  const [desiredClassLevelId, setDesiredClassLevelId] = useState("lvl-7");
  const [desiredShift, setDesiredShift] = useState<"MORNING" | "AFTERNOON" | "EVENING">("MORNING");

  // 4. Prova de Acesso Obrigatória
  const [selectedExamId, setSelectedExamId] = useState("");

  // 5. Documentos Obrigatórios / Anexos (Máx. 1000 KB cada)
  const [passportPhoto, setPassportPhoto] = useState<PassportPhotoValue | null>(null);
  const [idDocumentCopy, setIdDocumentCopy] = useState<File | null>(null);
  const [schoolCertificate, setSchoolCertificate] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Classes disponíveis para o ciclo selecionado
  const availableClasses = useMemo(() => {
    const cycle = EDUCATION_CYCLES.find((c) => c.id === selectedCycleId);
    return cycle ? cycle.classes : [];
  }, [selectedCycleId]);

  // Provas de acesso ativas combinando as sessões criadas no menu de Admissões
  const availableExams = useMemo(() => {
    const map = new Map<string, { id: string; title: string; date?: string; room?: string }>();

    // 1. Sessões criadas no módulo de Admissões (phase6Service)
    for (const s of phase6Sessions) {
      const statusLower = (s.status || "").toLowerCase();
      if (!s.status || statusLower === "agendada" || statusLower === "scheduled") {
        map.set(s.id, {
          id: s.id,
          title: s.title,
          date: s.scheduled_at,
          room: s.location ?? undefined,
        });
      }
    }

    // 2. Sessões/provas vindas de entranceExams
    for (const e of entranceExams) {
      const statusLower = (e.status || "").toLowerCase();
      if (!e.status || statusLower === "scheduled" || statusLower === "agendada") {
        if (!map.has(e.id)) {
          map.set(e.id, {
            id: e.id,
            title: e.title,
            date: (e as any).scheduled_at || e.examDate,
            room: (e as any).location || e.roomNumber,
          });
        }
      }
    }

    return Array.from(map.values());
  }, [phase6Sessions, entranceExams]);

  useEffect(() => {
    if (availableExams.length > 0 && !selectedExamId) {
      setSelectedExamId(availableExams[0].id);
    }
  }, [availableExams, selectedExamId]);

  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setGender("MALE");
      setBirthDate("2012-01-01");
      setIdDocumentType("IDENTITY_CARD");
      setIdDocumentNumber("");
      setNationality("Angolana");
      setPreviousSchoolName("");
      setGuardianMode("existing");
      setSelectedGuardianId("");
      setGuardianName("");
      setGuardianPhone("");
      setGuardianEmail("");
      setGuardianRelationship("FATHER");
      setSelectedCycleId("i-ciclo");
      setDesiredClassLevelId("lvl-7");
      setDesiredShift("MORNING");
      setPassportPhoto(null);
      setIdDocumentCopy(null);
      setSchoolCertificate(null);

      // Auto-selecionar a primeira prova de acesso agendada se existir
      if (availableExams.length > 0) {
        setSelectedExamId(availableExams[0].id);
      } else {
        setSelectedExamId("");
      }
    }
  }, [isOpen, availableExams]);

  const handleCycleChange = (cycleId: string) => {
    setSelectedCycleId(cycleId);
    const cycle = EDUCATION_CYCLES.find((c) => c.id === cycleId);
    if (cycle && cycle.classes.length > 0) {
      setDesiredClassLevelId(cycle.classes[0].id);
    }
  };

  const guardianOptions = useMemo(() => {
    return allGuardians.map((g) => ({
      value: g.id,
      label: `${g.fullName} (${formatPhone(g.phonePrimary)}${g.idDocumentNumber ? ` • ${g.idDocumentNumber}` : ""})`,
    }));
  }, [allGuardians]);

  const selectedGuardian = useMemo(() => {
    if (!selectedGuardianId) return null;
    return allGuardians.find((g) => g.id === selectedGuardianId) ?? null;
  }, [allGuardians, selectedGuardianId]);

  const docError = useMemo(() => {
    if (!idDocumentNumber || idDocumentNumber.trim().length === 0) return undefined;
    const res = validateIdDocumentByType(idDocumentNumber, idDocumentType);
    return res.valid ? undefined : res.message;
  }, [idDocumentNumber, idDocumentType]);

  const guardianPhoneError = useMemo(() => {
    if (guardianMode === "existing" || !guardianPhone) return undefined;
    const digits = cleanPhone(guardianPhone).replace(/\D/g, "");
    if (digits.length < 9) return "O número deve ter 9 dígitos";
    if (!/^(91|92|93|94|95|97|99)\d{7}$/.test(digits) && !digits.startsWith("244")) {
      return "Prefixo inválido para operadoras angolanas (91, 92, 93, 94, 95, 97, 99)";
    }
    return undefined;
  }, [guardianPhone, guardianMode]);

  const handleSelectExistingGuardian = (guardianId: string) => {
    setSelectedGuardianId(guardianId);
    const found = allGuardians.find((g) => g.id === guardianId);
    if (found) {
      setGuardianName(found.fullName);
      setGuardianPhone(found.phonePrimary);
      setGuardianEmail(found.email || "");
    } else {
      setGuardianName("");
      setGuardianPhone("");
      setGuardianEmail("");
    }
  };

  const handleModeChange = (mode: "existing" | "new") => {
    setGuardianMode(mode);
    setSelectedGuardianId("");
    setGuardianName("");
    setGuardianPhone("");
    setGuardianEmail("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 3) {
      ErrorMessage("Por favor, preencha o nome completo do candidato.");
      return;
    }
    const cleanDoc = cleanIdDocument(idDocumentNumber);
    const docValidation = validateIdDocumentByType(cleanDoc, idDocumentType);
    if (!docValidation.valid) {
      ErrorMessage(docValidation.message);
      return;
    }

    if (guardianMode === "existing") {
      if (!selectedGuardianId) {
        ErrorMessage("Por favor, selecione um encarregado existente.");
        return;
      }
    } else {
      if (!guardianName.trim() || guardianName.trim().length < 3) {
        ErrorMessage("Por favor, informe o nome do encarregado de educação.");
        return;
      }
      const digitsPhone = cleanPhone(guardianPhone).replace(/\D/g, "");
      if (digitsPhone.length < 9) {
        ErrorMessage("Por favor, informe o telefone do encarregado (mínimo 9 dígitos).");
        return;
      }
      if (!/^(91|92|93|94|95|97|99)\d{7}$/.test(digitsPhone) && !digitsPhone.startsWith("244")) {
        ErrorMessage("Prefixo do telefone do encarregado inválido para operadoras angolanas (91, 92, 93, 94, 95, 97, 99).");
        return;
      }
    }

    if (!selectedExamId) {
      ErrorMessage("É obrigatório selecionar a Prova de Acesso agendada para este candidato. Se não for prestar prova, cadastre-o diretamente como Aluno.");
      return;
    }

    if (!passportPhoto) {
      ErrorMessage("É obrigatório carregar e recortar a Foto Tipo Passe do candidato (máx. 1000 KB).");
      return;
    }

    if (!idDocumentCopy) {
      ErrorMessage("É obrigatório anexar a Cópia do Documento de Identificação (BI / Cédula) do candidato.");
      return;
    }

    if (idDocumentCopy.size > 1000 * 1024) {
      ErrorMessage("O ficheiro da cópia do BI excede o limite máximo permitido de 1000 KB.");
      return;
    }

    if (schoolCertificate && schoolCertificate.size > 1000 * 1024) {
      ErrorMessage("O certificado da escola anterior excede o limite máximo permitido de 1000 KB.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedClass = availableClasses.find((c) => c.id === desiredClassLevelId);
      const chosenExam = availableExams.find((e) => e.id === selectedExamId);

      const readFileAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      };

      const [idDocDataUrl, certDataUrl] = await Promise.all([
        readFileAsDataUrl(idDocumentCopy),
        schoolCertificate ? readFileAsDataUrl(schoolCertificate) : Promise.resolve(undefined),
      ]);

      const docs: ApplicationDocuments = {
        passportPhotoUrl: passportPhoto.previewUrl,
        passportPhotoName: passportPhoto.file.name,
        passportPhotoSize: passportPhoto.sizeBytes,
        idDocumentCopyName: idDocumentCopy.name,
        idDocumentCopyUrl: idDocDataUrl,
        idDocumentCopySize: idDocumentCopy.size,
        ...(schoolCertificate && certDataUrl
          ? {
              schoolCertificateName: schoolCertificate.name,
              schoolCertificateUrl: certDataUrl,
              schoolCertificateSize: schoolCertificate.size,
            }
          : {}),
      };

      await submitApplication(
        {
          fullName: fullName.trim(),
          gender,
          birthDate,
          idDocumentType,
          idDocumentNumber: cleanDoc,
          nationality: nationality.trim() || "Angolana",
          guardianName: guardianName.trim(),
          guardianPhone: cleanPhone(guardianPhone),
          guardianEmail: guardianEmail.trim() || undefined,
          guardianRelationship,
          previousSchoolName: previousSchoolName.trim() || undefined,
        },
        {
          desiredClassLevelId,
          desiredClassLevelName: selectedClass?.name || "7ª Classe",
          desiredShift,
          requiresEntranceExam: true,
          entranceExamId: selectedExamId,
          entranceExamTitle: chosenExam?.title || "Prova de Acesso",
        },
        docs
      );

      SucessMessage("Candidatura submetida com sucesso! Aguarda validação dos documentos pela Secretaria.");
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao submeter candidatura";
      ErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="GraduationCap" className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-left">
              <SheetTitle className="text-lg font-bold">
                Candidatura de Admissão & Prova de Acesso
              </SheetTitle>
              <SheetDescription className="text-xs">
                Inscrição obrigatória do candidato na prova de acesso da classe pretendida
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form
          id="candidate-application-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Secção 1: Dados do Candidato */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b">
              <Icon name="User" className="h-4 w-4 text-primary" />
              1. Dados Pessoais do Candidato (Pré-Aluno)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Nome Completo do Candidato *"
                  placeholder="Ex: Kiara Luísa Gaspar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <SelectField
                label="Género *"
                value={gender}
                onValueChange={(val) => setGender(val as "MALE" | "FEMALE")}
                options={[
                  { value: "MALE", label: "Masculino" },
                  { value: "FEMALE", label: "Feminino" },
                ]}
              />

              <Input
                label="Data de Nascimento *"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />

              <SelectField
                label="Tipo de Documento *"
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
                label="Número do Documento *"
                placeholder="Ex: 008432190LA045"
                value={idDocumentNumber}
                onChange={(e) => setIdDocumentNumber(e.target.value.toUpperCase())}
                error={docError}
                required
              />

              <Input
                label="Nacionalidade *"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Icon name="Users" className="h-4 w-4 text-primary" />
                2. Encarregado de Educação Responsável
              </h4>

              <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg self-start sm:self-auto border border-border/50">
                <button
                  type="button"
                  onClick={() => handleModeChange("existing")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    guardianMode === "existing"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon name="Users" className="w-3.5 h-3.5" />
                  <span>Selecionar Existente</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("new")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    guardianMode === "new"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon name="UserPlus" className="w-3.5 h-3.5" />
                  <span>Cadastrar Novo</span>
                </button>
              </div>
            </div>

            {guardianMode === "existing" ? (
              <div className="space-y-4">
                {isLoadingGuardians ? (
                  <p className="text-xs text-muted-foreground">A carregar encarregados registados...</p>
                ) : allGuardians.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Ainda não há encarregados registados nesta escola.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleModeChange("new")}
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Icon name="UserPlus" className="w-3.5 h-3.5" />
                      Cadastrar encarregado manualmente
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <SelectField
                      label="Encarregado Registado *"
                      value={selectedGuardianId}
                      placeholder="Selecione o encarregado da lista..."
                      options={guardianOptions}
                      onValueChange={handleSelectExistingGuardian}
                    />

                    {selectedGuardian && (
                      <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-1.5 text-xs animate-in fade-in-50 duration-200">
                        <div className="flex items-center justify-between font-medium text-foreground">
                          <span className="flex items-center gap-1.5">
                            <Icon name="User" className="w-3.5 h-3.5 text-primary" />
                            {selectedGuardian.fullName}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Icon name="Phone" className="w-3.5 h-3.5" />
                            {formatPhone(selectedGuardian.phonePrimary)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>
                            Doc: <strong className="text-foreground">{formatIdDocument(selectedGuardian.idDocumentNumber)}</strong>
                          </span>
                          {selectedGuardian.email && (
                            <span>
                              Email: <strong className="text-foreground">{selectedGuardian.email}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="sm:max-w-xs">
                  <SelectField
                    label="Grau de Parentesco para este Candidato *"
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Nome do Encarregado de Educação *"
                    placeholder="Ex: Gaspar António Gaspar"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Telefone Principal (WhatsApp) *"
                  placeholder="+244 923 000 000"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(formatPhone(e.target.value))}
                  error={guardianPhoneError}
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
                  label="Grau de Parentesco *"
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
            )}
          </div>

          {/* Secção 3: Pretensão Escolar (Ciclo + Classe) & Prova de Acesso Obrigatória */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 pb-1 border-b">
              <Icon name="BookOpen" className="h-4 w-4 text-primary" />
              3. Pretensão Escolar & Prova de Acesso Designada
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select 1: Ciclo de Ensino */}
              <SelectField
                label="Ciclo de Ensino *"
                value={selectedCycleId}
                onValueChange={handleCycleChange}
                options={EDUCATION_CYCLES.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />

              {/* Select 2: Classe Pretendida */}
              <SelectField
                label="Classe Pretendida *"
                value={desiredClassLevelId}
                onValueChange={(val) => setDesiredClassLevelId(val)}
                options={availableClasses.map((cl) => ({
                  value: cl.id,
                  label: cl.name,
                }))}
              />

              <div className="sm:col-span-2">
                <SelectField
                  label="Turno Pretendido *"
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
              </div>

              {/* Seleção Obrigatória da Prova de Acesso */}
              <div className="sm:col-span-2 space-y-2">
                {availableExams.length === 0 ? (
                  <div className="rounded-lg border border-amber-300/80 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium text-xs">
                      <Icon name="AlertTriangle" className="h-4 w-4" />
                      Não existem Provas de Acesso agendadas nesta escola.
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Segundo o regulamento escolar, as candidaturas exigem a vinculação a uma prova de acesso previamente registada. Crie uma sessão de prova de acesso no menu de Admissões antes de registar novos candidatos. Se o aluno não for fazer teste, cadastre-o diretamente no menu de Alunos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SelectField
                      label="Prova de Acesso Designada *"
                      value={selectedExamId}
                      placeholder="Selecione a sessão de prova de acesso..."
                      onValueChange={(val) => setSelectedExamId(val)}
                      options={availableExams.map((exam) => ({
                        value: exam.id,
                        label: `${exam.title} (${exam.date ? formatDate(exam.date) : "Data a definir"}${exam.room ? ` • Sala: ${exam.room}` : ""})`,
                      }))}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Icon name="CheckCircle2" className="h-3.5 w-3.5 text-primary" />
                      O candidato será vinculado a esta prova de acesso e a inscrição é ativada após a validação dos documentos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Secção 4: Documentos do Candidato (Foto Tipo Passe com Recorte, Cópia do BI, Certificado Escolar) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Icon name="Paperclip" className="h-4 w-4 text-primary" />
                4. Documentos Obrigatórios do Candidato
              </h4>
            </div>

            <div className="space-y-4">
              {/* 1. Foto tipo passe com ferramenta de recorte interativa */}
              <PassportPhotoCropper
                value={passportPhoto}
                onChange={setPassportPhoto}
                maxBytes={1000 * 1024}
                required
              />

              {/* 2. Cópia do Documento de Identificação (BI / Cédula) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Icon name="FileCheck" className="h-4 w-4 text-primary" />
                    Cópia do Documento de Identificação (BI / Cédula) *
                  </label>
                  <span className="text-[10px] text-muted-foreground">PDF, PNG ou JPEG · máx. 1000 KB</span>
                </div>
                <FileUpload
                  value={idDocumentCopy}
                  onChange={setIdDocumentCopy}
                  accept={PROOF_ACCEPT}
                  maxBytes={1000 * 1024}
                  label="Anexar cópia do BI / Documento de Identificação"
                  hint="PDF, PNG ou JPEG · Tamanho máximo 1000 KB"
                />
              </div>

              {/* 3. Certificado da escola passada (opcional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Icon name="GraduationCap" className="h-4 w-4 text-muted-foreground" />
                    Certificado / Declaração da Escola Anterior (Opcional)
                  </label>
                  <span className="text-[10px] text-muted-foreground">PDF, PNG ou JPEG · máx. 1000 KB</span>
                </div>
                <FileUpload
                  value={schoolCertificate}
                  onChange={setSchoolCertificate}
                  accept={PROOF_ACCEPT}
                  maxBytes={1000 * 1024}
                  label="Anexar certificado ou declaração anterior"
                  hint="PDF, PNG ou JPEG · Máximo 1000 KB (Opcional)"
                />
              </div>
            </div>
          </div>
        </form>

        <SheetFooter className="p-4 border-t flex flex-wrap items-center justify-between gap-2 bg-background shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="candidate-application-form"
            isLoading={isSubmitting}
            disabled={availableExams.length === 0 || !passportPhoto || !idDocumentCopy}
          >
            <Icon name="Check" className="h-4 w-4" />
            Submeter Candidatura
          </ButtonSubmit>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Backward-compatibility alias
export const CandidateApplicationModal = CandidateApplicationDrawer;
