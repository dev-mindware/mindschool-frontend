"use client";

import React, { useState } from "react";
import { GenericTable, Column } from "@/components/common/generic-table";
import { AdmissionApplication } from "@/types/admission";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components";
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
import { useAdmissionStore } from "@/stores/school/admission-store";
import { SucessMessage } from "@/utils/messages";

interface ApplicationsListProps {
  applications: AdmissionApplication[];
  total: number;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

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

export function ApplicationsList({
  applications,
  total,
  totalPages,
  currentPage,
  setCurrentPage,
  goToNextPage,
  goToPreviousPage,
}: ApplicationsListProps) {
  const { validateDocuments, promoteFromWaitlist, candidates } = useAdmissionStore();

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
            {new Date(item.submissionDate).toLocaleDateString("pt-AO")}
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
              <DropdownMenuItem
                onClick={() => handleValidateDocs(item.id)}
                className="gap-2 cursor-pointer text-info"
              >
                <Icon name="CircleCheck" className="h-4 w-4" />
                Validar Documentos
              </DropdownMenuItem>
            )}

            {item.requiresEntranceExam && item.status !== "ENROLLED" && (
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
            )}

            {item.status === "WAITLIST" && (
              <DropdownMenuItem
                onClick={() => handlePromoteWaitlist(item.id)}
                className="gap-2 cursor-pointer text-warning font-medium"
              >
                <Icon name="CircleArrowUp" className="h-4 w-4" />
                Promover da Lista de Espera
              </DropdownMenuItem>
            )}

            {(item.status === "DOCS_VALIDATED" ||
              item.status === "UNDER_REVIEW" ||
              item.status === "WAITLIST") && (
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
            )}

            {item.status === "APPROVED" && (
              <>
                <DropdownMenuSeparator />
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
      <div className="rounded-lg border bg-card">
        <GenericTable<AdmissionApplication>
          columns={columns}
          data={applications}
          page={currentPage}
          totalPages={totalPages}
          total={total}
          setPage={setCurrentPage}
          goToNextPage={goToNextPage}
          goToPreviousPage={goToPreviousPage}
          emptyMessage="Nenhuma candidatura encontrada com os filtros aplicados."
        />
      </div>

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
