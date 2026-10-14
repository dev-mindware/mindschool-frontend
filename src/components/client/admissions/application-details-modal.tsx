"use client";
import { formatDate, formatDateTime } from "@/utils";

import React from "react";
import { AdmissionApplication, Candidate } from "@/types/admission";
import {
  Button,
  Badge,
  DetailRow,
  Icon,
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
  UNDER_REVIEW: { label: "Em AvaliaÃ§Ã£o / Prova", variant: "secondary" },
  APPROVED: { label: "AdmissÃ£o Aprovada", variant: "default" },
  WAITLIST: { label: "Lista de Espera", variant: "secondary" },
  REJECTED: { label: "NÃ£o Admitido", variant: "destructive" },
  ENROLLED: { label: "Matriculado", variant: "default" },
  WITHDRAWN: { label: "Candidatura Desistente", variant: "outline" },
};

const SHIFT_LABELS: Record<string, string> = {
  MORNING: "ManhÃ£",
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
  if (!application || !isOpen) return null;

  const statusConfig = STATUS_LABELS[application.status] || {
    label: application.status,
    variant: "outline",
  };

  const phoneClean = application.guardianPhone.replace(/[^0-9]/g, "");

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <div className="flex items-center gap-3 pr-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="GraduationCap" className="h-6 w-6" />
            </div>
            <div className="space-y-1 text-left">
              <SheetTitle className="text-lg font-bold">{application.candidateName}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">N.Âº {application.applicationNumber}</span>
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  {application.waitlistPosition && (
                    <Badge variant="outline">{application.waitlistPosition}Âº Lugar na Fila de Espera</Badge>
                  )}
                </div>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6">
      <div className="space-y-6">
        {/* Bloco 1: Dados Pessoais do Candidato */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icon name="User" className="h-4 w-4 text-primary" />
            Dados do Candidato
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow label="Nome Completo" value={application.candidateName} />
            <DetailRow
              label="GÃ©nero"
              value={application.candidateGender === "MALE" ? "Masculino" : "Feminino"}
            />
            <DetailRow
              label="Data de Nascimento"
              value={formatDate(application.candidateBirthDate)}
            />
            <DetailRow
              label="Documento de IdentificaÃ§Ã£o"
              value={application.candidateDocumentNumber}
            />
            {candidate?.nationality && (
              <DetailRow label="Nacionalidade" value={candidate.nationality} />
            )}
            {candidate?.previousSchoolName && (
              <DetailRow label="Escola Anterior" value={candidate.previousSchoolName} />
            )}
          </div>
        </div>

        {/* Bloco 2: PretensÃ£o AcadÃ©mica & Vaga Solicitada */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icon name="BookOpen" className="h-4 w-4 text-primary" />
            PretensÃ£o Escolar & InscriÃ§Ã£o
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow label="Classe / NÃ­vel Pretendido" value={application.desiredClassLevelName} />
            <DetailRow
              label="Turno de PreferÃªncia"
              value={SHIFT_LABELS[application.desiredShift] || application.desiredShift}
            />
            <DetailRow label="Ano Lectivo" value={application.academicYear} />
            <DetailRow
              label="Data de SubmissÃ£o"
              value={formatDate(application.submissionDate)}
            />
            <DetailRow
              label="ExigÃªncia de Exame de Acesso"
              value={
                application.requiresEntranceExam ? (
                  <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20">
                    ObrigatÃ³rio para esta Classe
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                    Isento (AdmissÃ£o por Vaga Direta)
                  </Badge>
                )
              }
            />
            <DetailRow
              label="ValidaÃ§Ã£o de Documentos"
              value={
                application.documentsVerifiedAt ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Icon name="CircleCheck" className="h-3.5 w-3.5" />
                    Validado em {formatDate(application.documentsVerifiedAt)}
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                    <Icon name="Clock" className="h-3.5 w-3.5" />
                    Pendente de ValidaÃ§Ã£o pela Secretaria
                  </span>
                )
              }
            />
          </div>
        </div>

        {/* Bloco 3: Exame de Acesso & PontuaÃ§Ã£o */}
        {application.requiresEntranceExam && (
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icon name="FileText" className="h-4 w-4 text-primary" />
              Resultado do Exame de Acesso (purpose: prova_admissao)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <DetailRow
                label="Prova Designada"
                value={application.entranceExamTitle || "Exame de Acesso Curricular"}
              />
              <DetailRow
                label="Nota Obtida"
                value={
                  application.examScore !== undefined ? (
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded ${
                        application.examScore >= application.minPassingScore
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                      }`}
                    >
                      {application.examScore.toFixed(1)} valores (MÃ­nimo: {application.minPassingScore})
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Ainda nÃ£o corrigido / aguarda realizaÃ§Ã£o
                    </span>
                  )
                }
              />
            </div>
          </div>
        )}

        {/* Bloco 4: Encarregado de EducaÃ§Ã£o */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icon name="Phone" className="h-4 w-4 text-primary" />
              Encarregado de EducaÃ§Ã£o
            </h4>
            <a
              href={`https://wa.me/${phoneClean.startsWith("244") ? phoneClean : `244${phoneClean}`}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Icon name="MessageSquare" className="h-3.5 w-3.5" />
              Conversar no WhatsApp
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow label="Nome do Encarregado" value={application.guardianName} />
            <DetailRow label="Telefone de Contacto" value={application.guardianPhone} />
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
                    ? "MÃ£e"
                    : candidate.guardianRelationship === "TUTOR"
                    ? "Tutor Legal"
                    : "Outro"
                }
              />
            )}
          </div>
        </div>

        {/* Bloco 5: DecisÃ£o da DireÃ§Ã£o PedagÃ³gica & Auditoria (UC-00.1) */}
        {(application.decisionNotes || application.decidedBy) && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Icon name="ShieldCheck" className="h-4 w-4" />
              Despacho & Auditoria da DireÃ§Ã£o PedagÃ³gica
            </h4>
            {application.decisionNotes && (
              <p className="text-sm text-foreground leading-relaxed">
                {application.decisionNotes}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-primary/10">
              {application.decidedBy && (
                <span>
                  <strong>ResponsÃ¡vel:</strong> {application.decidedBy}
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
      </div>

        <SheetFooter>
          {application.status === "SUBMITTED" && onValidateDocs && (
            <Button variant="outline" onClick={() => { onValidateDocs(application.id); onClose(); }}>
              <Icon name="CircleCheck" className="h-4 w-4" />
              Validar Documentos
            </Button>
          )}

          {application.requiresEntranceExam &&
            application.status !== "ENROLLED" &&
            application.status !== "WITHDRAWN" &&
            onGradeExam && (
              <Button variant="outline" onClick={() => { onGradeExam(application); onClose(); }}>
                <Icon name="PenTool" className="h-4 w-4" />
                LanÃ§ar / Rever Nota do Exame
              </Button>
            )}

          {application.status === "WAITLIST" && onPromoteWaitlist && (
            <Button variant="outline" onClick={() => { onPromoteWaitlist(application.id); onClose(); }}>
              <Icon name="CircleArrowUp" className="h-4 w-4" />
              Promover da Lista de Espera
            </Button>
          )}

          {(application.status === "DOCS_VALIDATED" ||
            application.status === "UNDER_REVIEW" ||
            application.status === "WAITLIST") &&
            onDecide && (
              <Button variant="outline" onClick={() => { onDecide(application); onClose(); }}>
                <Icon name="Stamp" className="h-4 w-4" />
                Registar DecisÃ£o de AdmissÃ£o
              </Button>
            )}

          {application.status === "APPROVED" && onEnroll && (
            <Button onClick={() => { onEnroll(application); onClose(); }}>
              <Icon name="UserPlus" className="h-4 w-4" />
              Efetivar MatrÃ­cula (1 Clique)
            </Button>
          )}

          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
