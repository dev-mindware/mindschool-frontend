"use client";
import { formatDate, formatIdDocument, formatPhone } from "@/utils";

import React, { useState } from "react";
import { AdmissionApplication, EntranceExam } from "@/types/admission";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Can, ConfirmModal, DataList, Icon, type Column } from "@/components";
import { useModal } from "@/stores/modal/use-modal-store";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
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

interface ApplicationsListProps {
  applications: AdmissionApplication[];
  entranceExams?: EntranceExam[];
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

export function ApplicationsList({ applications, entranceExams = [] }: ApplicationsListProps) {
  const { validateDocuments, promoteFromWaitlist, candidates } = useAdmissions();

  const examOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const ex of entranceExams) {
      if (ex.id && ex.title) {
        map.set(ex.id, ex.title);
      }
    }
    for (const a of applications) {
      if (a.entranceExamId && a.entranceExamTitle) {
        map.set(a.entranceExamId, a.entranceExamTitle);
      }
    }
    const opts = Array.from(map.entries()).map(([value, label]) => ({ value, label }));
    opts.sort((a, b) => a.label.localeCompare(b.label, "pt"));
    return [
      { value: "sem_prova", label: "Sem prova / Isento" },
      ...opts,
    ];
  }, [entranceExams, applications]);

  // Modals state
  const [viewingApp, setViewingApp] = useState<AdmissionApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [decisionApp, setDecisionApp] = useState<AdmissionApplication | null>(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  const [gradingApp, setGradingApp] = useState<AdmissionApplication | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const [enrollingApp, setEnrollingApp] = useState<AdmissionApplication | null>(null);
  const [isEnrollingOpen, setIsEnrollingOpen] = useState(false);

  // validar documentos não é um clique às cegas: pede-se confirmação de que a foto, o documento de identificação e o certificado foram conferidos
  const [toValidate, setToValidate] = useState<AdmissionApplication | null>(null);
  const { openModal } = useModal();
  const handleValidateDocs = (appId: string) => {
    setToValidate(applications.find((a) => a.id === appId) ?? null);
    openModal("application-validate-docs");
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
          {item.passportPhotoUrl ? (
            <div className="h-9 w-7 rounded overflow-hidden border border-border shrink-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.passportPhotoUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                {item.candidateName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-foreground text-sm">
              {item.candidateName}
            </span>
            <span className="text-[11px] text-muted-foreground">
              BI: {formatIdDocument(item.candidateDocumentNumber)}
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
            <Badge variant="outline" className="text-[11px] text-muted-foreground border-border">
              Isento de Prova
            </Badge>
          );
        }

        if (item.examScore !== undefined) {
          const isPassed = item.examScore >= item.minPassingScore;
          return (
            <div className="flex flex-col gap-0.5">
              <Badge variant={isPassed ? "success" : "destructive"} className="text-xs">
                {item.examScore.toFixed(1)} val. {isPassed ? "✓ Aprovado" : "✗ Reprovado"}
              </Badge>
              <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                {item.entranceExamTitle || "Prova de Acesso"}
              </span>
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Icon name="Clock" className="h-3 w-3" />
              Aguardando Realização
            </span>
            <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
              {item.entranceExamTitle || "Prova de Acesso"}
            </span>
          </div>
        );
      },
    },
    {
      key: "guardianName",
      header: "Encarregado",
      render: (_, item) => {
        const phoneClean = item.guardianPhone.replace(/\D/g, "");
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
              {formatPhone(item.guardianPhone)}
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Abrir menu de ações">
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

            {item.requiresEntranceExam && !["ENROLLED", "APPROVED", "WITHDRAWN"].includes(item.status) && (
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
          { key: "ano", label: "Ano letivo", icon: "CalendarRange", options: uniq(applications.map((a) => a.academicYear)).map((v) => ({ value: v, label: v })), match: (a, v) => a.academicYear === v },
          { key: "genero", label: "Género", icon: "User", options: [{ value: "MALE", label: "Masculino" }, { value: "FEMALE", label: "Feminino" }], match: (a, v) => a.candidateGender === v },
          { key: "prova", label: "Prova de acesso", icon: "FileText", options: examOptions, match: (a, v) => (v === "sem_prova" ? (!a.requiresEntranceExam || !a.entranceExamId) : a.entranceExamId === v || a.entranceExamTitle === v) },
          { key: "exame", label: "Resultado da prova", icon: "PenTool", options: [{ value: "isento", label: "Isento" }, { value: "pendente", label: "Aguarda nota" }, { value: "aprovado", label: "Aprovado na prova" }, { value: "reprovado", label: "Reprovado na prova" }], match: (a, v) => (v === "isento" ? !a.requiresEntranceExam : v === "pendente" ? a.requiresEntranceExam && a.examScore === undefined : a.examScore !== undefined && (v === "aprovado" ? a.examScore >= a.minPassingScore : a.examScore < a.minPassingScore)) },
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

      <ConfirmModal
        id="application-validate-docs"
        title="Validar documentos do candidato"
        description={toValidate ? `Confirma que conferiu os documentos de ${toValidate.candidateName} (${toValidate.applicationNumber})?` : ""}
        confirmLabel="Validar documentos"
        effects={[
          "Foto tipo passe, cópia do documento de identificação e, se houver, o certificado da escola anterior.",
          "A candidatura passa a «documentos validados» e pode seguir para a prova ou para o despacho.",
          "Abra «Ver Ficha Completa» para ver os documentos antes de validar.",
        ]}
        onConfirm={() => (toValidate ? validateDocuments(toValidate.id).then(() => { SucessMessage("Documentos do candidato validados com sucesso!"); setToValidate(null); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível validar os documentos.")); throw e; }) : undefined)}
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
