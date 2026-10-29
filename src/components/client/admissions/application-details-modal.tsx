"use client";

import React from "react";
import { useAcademicYears } from "@/hooks/school/use-academic";
import { formatDate, formatDateTime, formatIdDocument, formatPhone } from "@/utils";
import { AdmissionApplication, Candidate } from "@/types/admission";
import {
  Button,
  Badge,
  DetailRow,
  Icon,
  Separator,
} from "@/components";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: AdmissionApplication | null;
  candidate?: Candidate | null;
  onValidateDocs?: (applicationId: string) => void;
  onGradeExam?: (application: AdmissionApplication) => void;
  onDecide?: (application: AdmissionApplication) => void;
  onEnroll?: (application: AdmissionApplication) => void;
  onPromoteWaitlist?: (applicationId: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  SUBMITTED: { label: "Submetida (Docs Pendentes)", variant: "outline" },
  DOCS_VALIDATED: { label: "Documentos Validados", variant: "secondary" },
  UNDER_REVIEW: { label: "Em Avaliação / Prova", variant: "secondary" },
  APPROVED: { label: "Admissão Aprovada", variant: "default" },
  WAITLIST: { label: "Lista de Espera", variant: "secondary" },
  REJECTED: { label: "Não Admitido", variant: "destructive" },
  ENROLLED: { label: "Matriculado", variant: "default" },
  WITHDRAWN: { label: "Candidatura Desistente", variant: "outline" },
};

const SHIFT_LABELS: Record<string, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
};

export function ApplicationDetailsModal({
  isOpen,
  onClose,
  application,
  candidate,
  onValidateDocs,
  onGradeExam,
  onDecide,
  onEnroll,
  onPromoteWaitlist,
}: ApplicationDetailsModalProps) {
  const { years } = useAcademicYears();
  if (!application || !isOpen) return null;
  const yearName = application.academicYear || years.find((y) => y.id === application.academicYearId)?.name || "—";

  const statusConfig = STATUS_LABELS[application.status] || {
    label: application.status,
    variant: "outline",
  };

  const phoneClean = application.guardianPhone.replace(/\D/g, "");

  const handleOpenDocument = (url?: string, defaultName = "documento") => {
    if (!url) return;
    if (url.startsWith("data:")) {
      try {
        const [header, base64] = url.split(",");
        const mime = header.match(/:(.*?);/)?.[1] || "application/octet-stream";
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const newTab = window.open(blobUrl, "_blank");
        if (!newTab) {
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = defaultName;
          a.click();
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        return;
      } catch (err) {
        console.error("Erro ao abrir anexo:", err);
      }
    }
    window.open(url, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <div className="flex items-center gap-3 pr-6">
            {application.passportPhotoUrl ? (
              <div className="h-14 w-11 rounded-xs overflow-hidden border border-border shrink-0 shadow-xs bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={application.passportPhotoUrl}
                  alt={application.candidateName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Icon name="GraduationCap" className="h-6 w-6" />
              </div>
            )}
            <div className="space-y-1 text-left">
              <SheetTitle className="text-lg font-bold">{application.candidateName}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">N.º {application.applicationNumber}</span>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  {application.waitlistPosition && (
                    <Badge variant="outline">{application.waitlistPosition}º Lugar na Fila de Espera</Badge>
                  )}
                </div>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Banner de Validação Documental se Pendente */}
          {application.status === "SUBMITTED" && onValidateDocs && (
            <div className="rounded-xs border border-amber-300/80 bg-amber-50 dark:bg-amber-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs">
                  <Icon name="AlertCircle" className="h-4 w-4" />
                  Validação Documental Pendente
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Verifique a foto tipo passe e a cópia do BI anexados. Ao validar, o candidato será confirmado e a sua vaga na prova de acesso é assegurada.
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                className="gap-1.5 shrink-0"
                onClick={() => {
                  onValidateDocs(application.id);
                  onClose();
                }}
              >
                <Icon name="CircleCheck" className="h-4 w-4" />
                Validar Documentos Agora
              </Button>
            </div>
          )}

          {/* Bloco 1: Dados Pessoais do Candidato */}
          <div className="rounded-xs bg-muted/30 p-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icon name="User" className="h-4 w-4 text-primary" />
              Dados do Candidato
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label="Nome Completo" value={application.candidateName} />
              <DetailRow
                label="Género"
                value={application.candidateGender === "MALE" ? "Masculino" : "Feminino"}
              />
              <DetailRow
                label="Data de Nascimento"
                value={formatDate(application.candidateBirthDate)}
              />
              <DetailRow
                label="Documento de Identificação"
                value={formatIdDocument(application.candidateDocumentNumber)}
              />
              {candidate?.nationality && (
                <DetailRow label="Nacionalidade" value={candidate.nationality} />
              )}
              {candidate?.previousSchoolName && (
                <DetailRow label="Escola Anterior" value={candidate.previousSchoolName} />
              )}
            </div>
          </div>

          <Separator />

          {/* Bloco: Documentos Submetidos do Candidato (Foto tipo passe, cópia BI, certificado) */}
          <div className="rounded-xs bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Icon name="Paperclip" className="h-4 w-4 text-primary" />
                Documentos Anexados do Candidato
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Foto Tipo Passe */}
              <div className="rounded-xs border p-3 flex flex-col items-center justify-center text-center gap-2 bg-muted/20">
                {application.passportPhotoUrl ? (
                  <div className="relative h-24 w-18 overflow-hidden rounded border shadow-xs bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={application.passportPhotoUrl}
                      alt="Foto Tipo Passe"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-24 w-18 rounded border-2 border-dashed flex items-center justify-center text-muted-foreground bg-muted/40">
                    <Icon name="User" className="h-8 w-8 opacity-40" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-foreground">Foto Tipo Passe (3:4)</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Recortada & Otimizada</p>
                </div>
              </div>

              {/* Cópia do BI */}
              <div className="rounded-xs border p-3 flex flex-col justify-between gap-2 bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Icon name="FileCheck" className="h-4 w-4" />
                    <span className="text-xs font-semibold">Cópia do BI / Cédula</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Doc: <strong className="text-foreground">{formatIdDocument(application.candidateDocumentNumber)}</strong>
                  </p>
                </div>
                {application.idDocumentCopyUrl ? (
                  <button
                    type="button"
                    onClick={() => handleOpenDocument(application.idDocumentCopyUrl, `BI_${application.candidateDocumentNumber}`)}
                    className="inline-flex items-center justify-center gap-1 text-xs text-primary bg-primary/10 hover:bg-primary/20 py-1.5 px-2 rounded font-medium transition-colors cursor-pointer"
                  >
                    <Icon name="Eye" className="h-3.5 w-3.5" />
                    Visualizar Anexo
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">Documento arquivado</span>
                )}
              </div>

              {/* Certificado da Escola Passada */}
              <div className="rounded-xs border p-3 flex flex-col justify-between gap-2 bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon name="GraduationCap" className="h-4 w-4" />
                    <span className="text-xs font-semibold">Certificado Anterior</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {candidate?.previousSchoolName || "Escola de origem"}
                  </p>
                </div>
                {application.previousSchoolCertificateUrl ? (
                  <button
                    type="button"
                    onClick={() => handleOpenDocument(application.previousSchoolCertificateUrl, `Certificado_${application.candidateName}`)}
                    className="inline-flex items-center justify-center gap-1 text-xs text-primary bg-primary/10 hover:bg-primary/20 py-1.5 px-2 rounded font-medium transition-colors cursor-pointer"
                  >
                    <Icon name="Eye" className="h-3.5 w-3.5" />
                    Visualizar Certificado
                  </button>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">Não anexado (opcional)</span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Bloco 2: Pretensão Académica & Inscrição */}
          <div className="rounded-xs bg-muted/30 p-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icon name="BookOpen" className="h-4 w-4 text-primary" />
              Pretensão Escolar & Inscrição
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label="Classe / Nível Pretendido" value={application.desiredClassLevelName} />
              <DetailRow
                label="Turno de Preferência"
                value={SHIFT_LABELS[application.desiredShift] || application.desiredShift}
              />
              <DetailRow label="Ano Letivo" value={yearName} />
              <DetailRow
                label="Data de Submissão"
                value={formatDate(application.submissionDate)}
              />
              <DetailRow
                label="Exame de Acesso"
                value={
                  application.requiresEntranceExam ? (
                    <Badge variant="info">
                      Obrigatório para esta Candidatura
                    </Badge>
                  ) : (
                    <Badge variant="success">
                      Isento (Admissão Direta)
                    </Badge>
                  )
                }
              />
              <DetailRow
                label="Validação de Documentos"
                value={
                  application.documentsVerifiedAt || application.status !== "SUBMITTED" ? (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Icon name="CircleCheck" className="h-3.5 w-3.5" />
                      {application.documentsVerifiedAt ? `Validado em ${formatDate(application.documentsVerifiedAt)}` : "Validados"}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <Icon name="Clock" className="h-3.5 w-3.5" />
                      Pendente de Validação pela Secretaria
                    </span>
                  )
                }
              />
            </div>
          </div>

          {/* Bloco 3: Exame de Acesso & Pontuação */}
          {application.requiresEntranceExam && (
            <>
              <Separator />
              <div className="rounded-xs bg-muted/30 p-3 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="FileText" className="h-4 w-4 text-primary" />
                  Resultado da Prova de Acesso
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <DetailRow
                    label="Prova Designada"
                    value={application.entranceExamTitle || "Prova de Acesso Curricular"}
                  />
                  <DetailRow
                    label="Nota Obtida"
                    value={
                      application.examScore !== undefined ? (
                        <Badge
                          variant={
                            application.examScore >= application.minPassingScore
                              ? "success"
                              : "destructive"
                          }
                        >
                          {application.examScore.toFixed(1)} valores (Mínimo: {application.minPassingScore})
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Ainda não corrigido / aguarda realização da prova
                        </span>
                      )
                    }
                  />
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Bloco 4: Encarregado de Educação */}
          <div className="rounded-xs bg-muted/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Icon name="Phone" className="h-4 w-4 text-primary" />
                Encarregado de Educação
              </h4>
              {phoneClean && (
                <a
                  href={`https://wa.me/${phoneClean.startsWith("244") ? phoneClean : `244${phoneClean}`}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Icon name="MessageSquare" className="h-3.5 w-3.5" />
                  Conversar no WhatsApp
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <DetailRow label="Nome do Encarregado" value={application.guardianName} />
              <DetailRow label="Telefone de Contacto" value={formatPhone(application.guardianPhone)} />
              {candidate?.guardianEmail && (
                <DetailRow label="E-mail" value={candidate.guardianEmail} />
              )}
              {candidate?.guardianRelationship && (
                <DetailRow
                  label="Grau de Parentesco"
                  value={
                    candidate.guardianRelationship === "FATHER"
                      ? "Pai"
                      : candidate.guardianRelationship === "MOTHER"
                      ? "Mãe"
                      : candidate.guardianRelationship === "TUTOR"
                      ? "Tutor Legal"
                      : "Outro"
                  }
                />
              )}
            </div>
          </div>

          {/* Bloco 5: Decisão da Direção Pedagógica & Auditoria */}
          {(application.decisionNotes || application.decidedBy) && (
            <div className="rounded-xs border border-primary/20 bg-primary/5 p-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Icon name="ShieldCheck" className="h-4 w-4" />
                Despacho & Decisão da Direção Pedagógica
              </h4>
              {application.decisionNotes && (
                <p className="text-sm text-foreground leading-relaxed">
                  {application.decisionNotes}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-primary/10">
                {application.decidedBy && (
                  <span>
                    <strong>Responsável:</strong> {application.decidedBy}
                  </span>
                )}
                {application.decidedAt && (
                  <span>
                    <strong>Data:</strong> {formatDateTime(application.decidedAt)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {application.status === "SUBMITTED" && onValidateDocs && (
              <Button variant="outline" onClick={() => { onValidateDocs(application.id); onClose(); }}>
                <Icon name="CircleCheck" className="h-4 w-4" />
                Validar Documentos
              </Button>
            )}

            {application.requiresEntranceExam &&
              !["ENROLLED", "APPROVED", "WITHDRAWN"].includes(application.status) &&
              onGradeExam && (
                <Button variant="outline" onClick={() => { onGradeExam(application); onClose(); }}>
                  <Icon name="PenTool" className="h-4 w-4" />
                  Lançar Nota da Prova
                </Button>
              )}

            {application.status === "WAITLIST" && onPromoteWaitlist && (
              <Button variant="outline" onClick={() => { onPromoteWaitlist(application.id); onClose(); }}>
                <Icon name="CircleArrowUp" className="h-4 w-4" />
                Promover da Fila de Espera
              </Button>
            )}

            {(application.status === "DOCS_VALIDATED" ||
              application.status === "UNDER_REVIEW" ||
              application.status === "WAITLIST") &&
              onDecide && (
                <Button variant="outline" onClick={() => { onDecide(application); onClose(); }}>
                  <Icon name="Stamp" className="h-4 w-4" />
                  Registar Decisão de Admissão
                </Button>
              )}

            {application.status === "APPROVED" && onEnroll && (
              <Button onClick={() => { onEnroll(application); onClose(); }}>
                <Icon name="UserPlus" className="h-4 w-4" />
                Efetivar Matrícula do Aluno
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
