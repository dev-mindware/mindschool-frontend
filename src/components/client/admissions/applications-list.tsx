"use client";
import { formatDate } from "@/utils";

import React, { useState } from "react";
import { AdmissionApplication } from "@/types/admission";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Can, DataList, Icon, type Column } from "@/components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApplicationDetailsModal } from "./application-details-modal";
import { DecisionModal } from "./decision-modal";
import { GradeExamModal } from "./grade-exam-modal";
import { ConvertToEnrollmentModal } from "./convert-to-enrollment-modal";
import { useAdmissions } from "@/hooks/school/use-admissions";
import { SucessMessage } from "@/utils/messages";

interface ApplicationsListProps {
  applications: AdmissionApplication[];
}

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
> = {
  SUBMITTED: { label: "Submetida", variant: "info" },
  DOCS_VALIDATED: { label: "Docs Validados", variant: "info" },
  UNDER_REVIEW: { label: "Em Avaliação", variant: "default" },
  APPROVED: { label: "Aprovado", variant: "success" },
  WAITLIST: { label: "Lista de Espera", variant: "warning" },
  REJECTED: { label: "Não Admitido", variant: "destructive" },
  ENROLLED: { label: "Matriculado", variant: "default" },
  WITHDRAWN: { label: "Desistente", variant: "secondary" },
};

export function ApplicationsList({ applications }: ApplicationsListProps) {
  const { validateDocuments, promoteFromWaitlist, candidates } = useAdmissions();

  // Modals state
  const [viewingApp, setViewingApp] = useState<AdmissionApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [decisionApp, setDecisionApp] = useState<AdmissionApplication | null>(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  const [gradingApp, setGradingApp] = useState<AdmissionApplication | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const [enrollingApp, setEnrollingApp] = useState<AdmissionApplication | null>(null);
  const [isEnrollingOpen, setIsEnrollingOpen] = useState(false);

  const handleValidateDocs = async (appId: string) => {
    await validateDocuments(appId);
    SucessMessage("Documentos do candidato validados com sucesso!");
  };

  const handlePromoteWaitlist = async (appId: string) => {
    await promoteFromWaitlist(appId);
    SucessMessage("Candidato promovido da lista de espera com sucesso! Pronto para matrícula.");
  };

  const columns: Column<AdmissionApplication>[] = [
    {
      key: "applicationNumber",
      header: "N.º Candidatura",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-foreground">
            {item.applicationNumber}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(item.submissionDate)}
          </span>
        </div>
      ),
    },
    {
      key: "candidateName",
      header: "Candidato",
      render: (_, item) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs shrink-0">
            {item.candidateName.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">
              {item.candidateName}
            </span>
            <span className="text-[11px] text-muted-foreground">
              BI: {item.candidateDocumentNumber}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "desiredClassLevelName",
      header: "Pretensão",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.desiredClassLevelName}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Turno: {item.desiredShift === "MORNING" ? "Manhã" : item.desiredShift === "AFTERNOON" ? "Tarde" : "Noite"}
          </span>
        </div>
      ),
    },
    {
      key: "requiresEntranceExam",
      header: "Exame de Acesso",
      render: (_, item) => {
        if (!item.requiresEntranceExam) {
          return (
            <Badge variant="success" className="text-[11px]">
              Isento de Prova
            </Badge>
          );
        }

        if (item.examScore !== undefined) {
          const isPassed = item.examScore >= item.minPassingScore;
          return (
            <div className="flex flex-col gap-0.5">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded w-fit border ${
                  isPassed
                    ? "border-success-border bg-success-muted text-success"
                    : "border-destructive-border bg-destructive-muted text-destructive"
                }`}
              >
                {item.examScore.toFixed(1)} val. {isPassed ? "✓" : "✗"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {item.entranceExamTitle || "Exame Curricular"}
              </span>
            </div>
          );
        }

        return (
          <span className="text-xs text-warning italic flex items-center gap-1">
            <Icon name="Clock" className="h-3 w-3" />
            Aguardando Nota
          </span>
        );
      },
    },
    {
      key: "guardianName",
      header: "Encarregado",
      render: (_, item) => {
        const phoneClean = item.guardianPhone.replace(/[^0-9]/g, "");
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {item.guardianName}
            </span>
            <a
              href={`https://wa.me/${phoneClean.startsWith("244") ? phoneClean : `244${phoneClean}`}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-success hover:underline flex items-center gap-1 font-medium"
            >
              <Icon name="MessageSquare" className="h-3 w-3" />
              {item.guardianPhone}
            </a>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Estado",
      render: (_, item) => {
        const cfg = STATUS_CONFIG[item.status] || {
          label: item.status,
          variant: "outline",
        };
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge variant={cfg.variant} className="text-xs py-0.5">
              {cfg.label}
            </Badge>
            {item.status === "WAITLIST" && item.waitlistPosition && (
              <span className="text-[10px] font-semibold text-warning">
                {item.waitlistPosition}º na fila
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Ações",
      render: (_, item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Icon name="EllipsisVertical" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => {
                setViewingApp(item);
                setIsDetailsOpen(true);
              }}
              className="gap-2 cursor-pointer"
            >
              <Icon name="Eye" className="h-4 w-4 text-info" />
              Ver Ficha Completa
            </DropdownMenuItem>

            {item.status === "SUBMITTED" && (
<Can permission="admission:write">
              <DropdownMenuItem
                onClick={() => handleValidateDocs(item.id)}
                className="gap-2 cursor-pointer text-info"
              >
                <Icon name="CircleCheck" className="h-4 w-4" />
                Validar Documentos
              </DropdownMenuItem>
</Can>
            )}

            {item.requiresEntranceExam && item.status !== "ENROLLED" && (
<Can permission="admission:write">
              <DropdownMenuItem
                onClick={() => {
                  setGradingApp(item);
                  setIsGradingOpen(true);
                }}
                className="gap-2 cursor-pointer text-warning"
              >
                <Icon name="PenTool" className="h-4 w-4" />
                Lançar / Rever Nota do Exame
              </DropdownMenuItem>
</Can>
            )}

            {item.status === "WAITLIST" && (
<Can permission="admission:decide">
              <DropdownMenuItem
                onClick={() => handlePromoteWaitlist(item.id)}
                className="gap-2 cursor-pointer text-warning font-medium"
              >
                <Icon name="CircleArrowUp" className="h-4 w-4" />
                Promover da Lista de Espera
              </DropdownMenuItem>
</Can>
            )}

            {(item.status === "DOCS_VALIDATED" ||
              item.status === "UNDER_REVIEW" ||
              item.status === "WAITLIST") && (
<Can permission="admission:decide">
              <DropdownMenuItem
                onClick={() => {
                  setDecisionApp(item);
                  setIsDecisionOpen(true);
                }}
                className="gap-2 cursor-pointer text-primary font-medium"
              >
                <Icon name="Stamp" className="h-4 w-4" />
                Despacho da Direção
              </DropdownMenuItem>
</Can>
            )}

            {item.status === "APPROVED" && (
              <>
                <DropdownMenuSeparator />
<Can permission="enrollment:write">
                <DropdownMenuItem
                  onClick={() => {
                    setEnrollingApp(item);
                    setIsEnrollingOpen(true);
                  }}
                  className="gap-2 cursor-pointer text-success font-semibold bg-success-muted"
                >
                  <Icon name="UserPlus" className="h-4 w-4" />
                  Efetivar Matrícula (1 Clique)
                </DropdownMenuItem>
</Can>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const viewingCandidate = viewingApp
    ? candidates.find((c) => c.id === viewingApp.candidateId)
    : null;

  return (
    <>
      <DataList<AdmissionApplication>
        prefix="candidaturas"
        rows={applications}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Pesquisar por candidato, n.º de candidatura, BI ou encarregado"
        searchText={(a) => `${a.candidateName} ${a.candidateDocumentNumber} ${a.applicationNumber} ${a.guardianName} ${a.guardianPhone}`}
        filters={[
          { key: "estado", label: "Estado", icon: "ListFilter", options: Object.entries(STATUS_CONFIG).map(([value, c]) => ({ value, label: c.label })), match: (a, v) => a.status === v },
          { key: "turno", label: "Turno", icon: "Sun", options: [{ value: "MORNING", label: "Manhã" }, { value: "AFTERNOON", label: "Tarde" }, { value: "EVENING", label: "Noite" }], match: (a, v) => a.desiredShift === v },
          { key: "classe", label: "Classe pretendida", icon: "GraduationCap", options: uniq(applications.map((a) => a.desiredClassLevelName)).map((v) => ({ value: v, label: v })), match: (a, v) => a.desiredClassLevelName === v },
          { key: "ano", label: "Ano lectivo", icon: "CalendarRange", options: uniq(applications.map((a) => a.academicYear)).map((v) => ({ value: v, label: v })), match: (a, v) => a.academicYear === v },
          { key: "genero", label: "Género", icon: "User", options: [{ value: "MALE", label: "Masculino" }, { value: "FEMALE", label: "Feminino" }], match: (a, v) => a.candidateGender === v },
          { key: "exame", label: "Exame de acesso", icon: "PenTool", options: [{ value: "isento", label: "Isento" }, { value: "pendente", label: "Aguarda nota" }, { value: "aprovado", label: "Aprovado na prova" }, { value: "reprovado", label: "Reprovado na prova" }], match: (a, v) => (v === "isento" ? !a.requiresEntranceExam : v === "pendente" ? a.requiresEntranceExam && a.examScore === undefined : a.examScore !== undefined && (v === "aprovado" ? a.examScore >= a.minPassingScore : a.examScore < a.minPassingScore)) },
          { key: "docs", label: "Documentos", icon: "FileCheck", options: [{ value: "validados", label: "Validados" }, { value: "pendentes", label: "Por validar" }], match: (a, v) => (v === "validados" ? Boolean(a.documentsVerifiedAt) : !a.documentsVerifiedAt) },
        ]}
        dateFilters={[{ key: "submissao", label: "Submissão", getDate: (a) => a.submissionDate }]}
        sorts={[
          { value: "data", label: "Data de submissão", compare: (a, b) => a.submissionDate.localeCompare(b.submissionDate) },
          { value: "nome", label: "Candidato", compare: (a, b) => a.candidateName.localeCompare(b.candidateName, "pt") },
          { value: "nota", label: "Nota do exame", compare: (a, b) => (a.examScore ?? -1) - (b.examScore ?? -1) },
        ]}
        emptyTitle="Nenhuma candidatura encontrada"
        emptyDescription="Ajuste os filtros ou registe uma nova candidatura."
        emptyIcon="GraduationCap"
      />

      {/* Modais Integrados */}
      {viewingApp && (
        <ApplicationDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setViewingApp(null);
          }}
          application={viewingApp}
          candidate={viewingCandidate}
          onValidateDocs={handleValidateDocs}
          onGradeExam={(app) => {
            setGradingApp(app);
            setIsGradingOpen(true);
          }}
          onDecide={(app) => {
            setDecisionApp(app);
            setIsDecisionOpen(true);
          }}
          onEnroll={(app) => {
            setEnrollingApp(app);
            setIsEnrollingOpen(true);
          }}
          onPromoteWaitlist={handlePromoteWaitlist}
        />
      )}

      {decisionApp && (
        <DecisionModal
          isOpen={isDecisionOpen}
          onClose={() => {
            setIsDecisionOpen(false);
            setDecisionApp(null);
          }}
          application={decisionApp}
        />
      )}

      {gradingApp && (
        <GradeExamModal
          isOpen={isGradingOpen}
          onClose={() => {
            setIsGradingOpen(false);
            setGradingApp(null);
          }}
          application={gradingApp}
        />
      )}

      {enrollingApp && (
        <ConvertToEnrollmentModal
          isOpen={isEnrollingOpen}
          onClose={() => {
            setIsEnrollingOpen(false);
            setEnrollingApp(null);
          }}
          application={enrollingApp}
        />
      )}
    </>
  );
}
