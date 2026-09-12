"use client";

import React from "react";
import { AdmissionApplication, Candidate } from "@/types/admission";
import {
  GlobalModal,
  Button,
  Badge,
  DetailRow,
  Icon,
} from "@/components";

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
  if (!application || !isOpen) return null;

  const statusConfig = STATUS_LABELS[application.status] || {
    label: application.status,
    variant: "outline",
  };

  const phoneClean = application.guardianPhone.replace(/[^0-9]/g, "");

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title={
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="GraduationCap" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {application.candidateName}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                N.º {application.applicationNumber}
              </span>
              <Badge variant={statusConfig.variant} className="text-[11px] py-0.5">
                {statusConfig.label}
              </Badge>
              {application.waitlistPosition && (
                <Badge variant="outline" className="text-[11px] py-0.5 border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-950/20">
                  {application.waitlistPosition}º Lugar na Fila de Espera
                </Badge>
              )}
            </div>
          </div>
        </div>
      }
      className="!max-h-[88vh] !w-[95vw] sm:!max-w-2xl lg:!max-w-3xl overflow-y-auto"
    >
      <div className="space-y-6 pt-2">
        {/* Bloco 1: Dados Pessoais do Candidato */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icon name="User" className="h-4 w-4 text-primary" />
            Dados do Candidato
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow label="Nome Completo" value={application.candidateName} />
            <DetailRow
              label="Género"
              value={application.candidateGender === "MALE" ? "Masculino" : "Feminino"}
            />
            <DetailRow
              label="Data de Nascimento"
              value={new Date(application.candidateBirthDate).toLocaleDateString("pt-AO")}
            />
            <DetailRow
              label="Documento de Identificação"
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

        {/* Bloco 2: Pretensão Académica & Vaga Solicitada */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Icon name="BookOpen" className="h-4 w-4 text-primary" />
            Pretensão Escolar & Inscrição
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow label="Classe / Nível Pretendido" value={application.desiredClassLevelName} />
            <DetailRow
              label="Turno de Preferência"
              value={SHIFT_LABELS[application.desiredShift] || application.desiredShift}
            />
            <DetailRow label="Ano Lectivo" value={application.academicYear} />
            <DetailRow
              label="Data de Submissão"
              value={new Date(application.submissionDate).toLocaleDateString("pt-AO")}
            />
            <DetailRow
              label="Exigência de Exame de Acesso"
              value={
                application.requiresEntranceExam ? (
                  <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20">
                    Obrigatório para esta Classe
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                    Isento (Admissão por Vaga Direta)
                  </Badge>
                )
              }
            />
            <DetailRow
              label="Validação de Documentos"
              value={
                application.documentsVerifiedAt ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Icon name="CircleCheck" className="h-3.5 w-3.5" />
                    Validado em {new Date(application.documentsVerifiedAt).toLocaleDateString("pt-AO")}
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
                      {application.examScore.toFixed(1)} valores (Mínimo: {application.minPassingScore})
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Ainda não corrigido / aguarda realização
                    </span>
                  )
                }
              />
            </div>
          </div>
        )}

        {/* Bloco 4: Encarregado de Educação */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Icon name="Phone" className="h-4 w-4 text-primary" />
              Encarregado de Educação
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
                    ? "Mãe"
                    : candidate.guardianRelationship === "TUTOR"
                    ? "Tutor Legal"
                    : "Outro"
                }
              />
            )}
          </div>
        </div>

        {/* Bloco 5: Decisão da Direção Pedagógica & Auditoria (UC-00.1) */}
        {(application.decisionNotes || application.decidedBy) && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Icon name="ShieldCheck" className="h-4 w-4" />
              Despacho & Auditoria da Direção Pedagógica
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
                  <strong>Data:</strong> {new Date(application.decidedAt).toLocaleString("pt-AO")}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Ações contextuais de rodapé */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t">
          {application.status === "SUBMITTED" && onValidateDocs && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onValidateDocs(application.id);
                onClose();
              }}
              className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Icon name="CircleCheck" className="h-4 w-4" />
              Validar Documentos
            </Button>
          )}

          {application.requiresEntranceExam &&
            application.status !== "ENROLLED" &&
            application.status !== "WITHDRAWN" &&
            onGradeExam && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onGradeExam(application);
                  onClose();
                }}
                className="gap-1.5"
              >
                <Icon name="PenTool" className="h-4 w-4" />
                Lançar / Rever Nota do Exame
              </Button>
            )}

          {application.status === "WAITLIST" && onPromoteWaitlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onPromoteWaitlist(application.id);
                onClose();
              }}
              className="gap-1.5 border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40"
            >
              <Icon name="CircleArrowUp" className="h-4 w-4" />
              Promover da Lista de Espera
            </Button>
          )}

          {(application.status === "DOCS_VALIDATED" ||
            application.status === "UNDER_REVIEW" ||
            application.status === "WAITLIST") &&
            onDecide && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDecide(application);
                  onClose();
                }}
                className="gap-1.5"
              >
                <Icon name="Stamp" className="h-4 w-4" />
                Registar Decisão de Admissão
              </Button>
            )}

          {application.status === "APPROVED" && onEnroll && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onEnroll(application);
                onClose();
              }}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              <Icon name="UserPlus" className="h-4 w-4" />
              Efetivar Matrícula (1 Clique)
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
