"use client";

import { formatDateTime } from "@/utils";
import { useState } from "react";
import {
  Badge,
  ButtonOnlyAction,
  DataList,
  EmptyState,
  Icon,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TitleList,
  type Column,
} from "@/components";
import { useAudit } from "@/hooks/school/use-admin-school";
import { adminSchoolService, type ApiAuditEvent } from "@/services/admin-school-service";
import { useModal } from "@/stores/modal/use-modal-store";

/** Módulos traduzidos segundo a norma ortográfica AO1945 aplicada em Angola. */
const MODULES: Record<string, string> = {
  academico: "Gestão Académica",
  avaliacao: "Avaliação Pedagógica",
  pessoas: "Recursos Humanos & Alunos",
  financeiro: "Tesouraria & Faturação",
  documentos: "Secretaria & Arquivo",
  organizacao: "Organização Escolar",
  comunicacao: "Comunicação & Notificações",
  relatorios: "Relatórios & Mapas MED",
};

/** Ações de auditoria em conformidade com o AO1945. */
const ACTIONS: Record<string, string> = {
  criacao: "Criação",
  actualizacao: "Atualização",
  fecho: "Fecho",
  reabertura: "Reabertura",
  anulacao: "Anulação",
};

/** Entidades institucionais traduzidas. */
const ENTITIES: Record<string, string> = {
  activity: "Atividade extracurricular",
  activity_enrollment: "Inscrição em atividade",
  admission_exam_registration: "Inscrição na prova de acesso",
  app_user: "Utilizador",
  archive_bundle: "Pacote de arquivo",
  bell_schedule: "Grelha de tempos",
  calendar_event: "Evento do calendário",
  class_council_decision: "Decisão do conselho de turma",
  document_export: "Exportação de documento",
  exam: "Prova online",
  final_exam_result: "Resultado de exame final",
  google_integration: "Integração Google",
  guardian_invite: "Convite de encarregado",
  guardian_notification_preference: "Preferências de notificação",
  health_record: "Ficha de saúde",
  health_visit: "Visita à enfermaria",
  holiday_decision: "Decisão sobre feriado",
  impersonation: "Acesso de suporte",
  import_job: "Importação de dados",
  integration_auth_code: "Autorização de integração",
  lesson_summary: "Sumário de aula",
  library_request: "Pedido de empréstimo",
  pauta_snapshot: "Instantâneo da pauta",
  plan: "Plano de subscrição",
  psycho_case: "Caso psicopedagógico",
  qr_credential: "Credencial QR",
  risk_alert: "Alerta de abandono",
  room: "Sala",
  school_bank_account: "Coordenada bancária",
  school_integration: "Integração MindGest",
  section_subject: "Disciplina da turma",
  stored_object: "Ficheiro guardado",
  student_attendance: "Presença do aluno",
  student_invite: "Convite de aluno",
  subscription: "Subscrição",
  subscription_order: "Pedido de subscrição",
  teacher_attendance: "Ponto do professor",
  teacher_calendar_link: "Calendário do professor",
  timetable: "Horário",
  timetable_change: "Mudança de horário",
  timetable_entry: "Aula do horário",
  transport_assignment: "Atribuição de transporte",
  transport_route: "Rota de transporte",
  user_school_role: "Papel de utilizador",
  invoice: "Fatura / Propina",
  payment: "Pagamento / Recibo",
  enrollment: "Matrícula / Inscrição",
  student: "Estudante",
  grade: "Classificação / Nota",
  assessment: "Avaliação / Prova",
  attendance: "Registo de Assiduidade",
  lesson: "Aula / Sumário",
  section: "Turma",
  subject: "Disciplina",
  teacher: "Docente",
  guardian: "Encarregado de Educação",
  guardian_student: "Vínculo de Encarregado",
  user: "Utilizador",
  pauta: "Pauta Trimestral",
  bank_account: "Coordenada Bancária",
  school_settings: "Políticas da Escola",
  group_access: "Acesso do grupo",
  med_snapshot: "Mapa do MED",
  report_job: "Exportação de relatório",
  library_loan: "Empréstimo da biblioteca",
  library_book: "Obra da biblioteca",
  secretary_request: "Requerimento",
  announcement: "Comunicado",
  tuition_submission: "Comprovativo de pagamento",
  candidate: "Candidato",
  admission_application: "Candidatura",
  admission_exam_session: "Sessão da prova de acesso",
  school: "Escola",
  academic_year: "Ano letivo",
  term: "Período letivo",
  class_level: "Classe",
  class_council: "Conselho de turma",
  final_exam: "Exame final",
  grade_review: "Reapreciação de nota",
  document_issued: "Documento emitido",
  membership: "Papel de utilizador",
  settlement: "Liquidação",
  fiscal_document: "Fatura-recibo",
};

const formatModule = (m: string) => MODULES[m] ?? (m.charAt(0).toUpperCase() + m.slice(1));
const formatAction = (a: string, entity?: string) => (a === "fecho" && entity === "library_loan" ? "Devolução" : (ACTIONS[a] ?? (a.charAt(0).toUpperCase() + a.slice(1))));
const formatEntity = (e: string) => ENTITIES[e] ?? (e.charAt(0).toUpperCase() + e.slice(1).replaceAll("_", " "));

type Detail = { before?: unknown; after?: unknown; reason?: string | null };

const DETAIL_MODAL_ID = "settings-audit-detail";

/** Registo imutável de auditoria da escola em português de Angola (AO1945). */
export function AuditPageContent() {
  // «Acessos do grupo»: quem entrou nesta escola a partir de outra do grupo (titular/direcção pedagógica).
  const [groupOnly, setGroupOnly] = useState(false);
  const { events, hasMore, isLoading, forbidden } = useAudit(groupOnly ? { entity_type: "group_access" } : {});
  const { open: modalState, openModal, closeModal } = useModal();
  const [current, setCurrent] = useState<ApiAuditEvent | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  if (forbidden)
    return (
      <EmptyState
        icon="Lock"
        title="Sem autorização de acesso"
        description="O seu perfil de utilizador não possui permissão para consultar o livro de auditoria da instituição."
      />
    );

  const openDetail = (e: ApiAuditEvent) => {
    setCurrent(e);
    setDetail(null);
    openModal(DETAIL_MODAL_ID);
    void adminSchoolService.auditEvent(e.id).then(setDetail);
  };

  const actors = [...new Map(events.map((e) => [e.actor.id, e.actor.full_name])).entries()];
  const uniqueEntities = [...new Set(events.map((e) => e.entity_type))].sort();

  const columns: Column<ApiAuditEvent>[] = [
    {
      key: "occurred_at",
      header: "Data & Hora",
      render: (_, e) => (
        <span className="font-mono text-xs whitespace-nowrap text-foreground">
          {formatDateTime(e.occurred_at)}
        </span>
      ),
    },
    {
      key: "actor.full_name",
      header: "Autor da Ação",
      render: (_, e) => (
        <span className="font-semibold text-foreground text-xs">{e.actor.full_name}</span>
      ),
    },
    {
      key: "action",
      header: "Ação Realizada",
      render: (_, e) => {
        const isDanger = e.action === "anulacao";
        const isSuccess = e.action === "criacao" || e.action === "fecho";
        return (
          <Badge
            variant={isDanger ? "destructive" : isSuccess ? "success" : "outline"}
            className={!isDanger && !isSuccess ? "border-primary/30 bg-primary/10 text-primary text-[10px]" : "text-[10px]"}
          >
            {formatAction(e.action, e.entity_type)}
          </Badge>
        );
      },
    },
    {
      key: "entity_type",
      header: "Entidade & Módulo",
      render: (_, e) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs text-foreground">{formatEntity(e.entity_type)}</span>
          <span className="text-[11px] text-muted-foreground">{formatModule(e.module)}</span>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Motivo Formal",
      render: (_, e) => (
        <span className="text-xs text-muted-foreground">
          {e.reason ? (
            <span className="italic">«{e.reason}»</span>
          ) : (
            <span className="opacity-50">—</span>
          )}
        </span>
      ),
    },
    {
      key: "ip",
      header: "Endereço IP",
      render: (_, e) => (
        <span className="font-mono text-[11px] text-muted-foreground">{e.ip ?? "—"}</span>
      ),
    },
    {
      key: "action_menu",
      header: "Operação",
      render: (_, e) => (
        <ButtonOnlyAction
          data={e}
          actions={[{ label: "Consultar Registo", icon: "Eye", onClick: openDetail }]}
        />
      ),
    },
  ];

  const isSheetOpen = Boolean(modalState[DETAIL_MODAL_ID]);

  return (
    <div className="space-y-6">
      <TitleList
        title="Livro de Auditoria e Rastreabilidade"
        suTitle="Registo cronológico de acções e alterações no sistema."
      />

      <Tabs
        value={groupOnly ? "group" : "all"}
        onValueChange={(v) => setGroupOnly(v === "group")}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            <Icon name="ScrollText" className="size-4" />
            Todos os registos
          </TabsTrigger>
          <TabsTrigger value="group" className="gap-1.5">
            <Icon name="Building2" className="size-4" />
            Acessos do grupo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="group" className="mt-0">
          <p className="text-xs text-muted-foreground mb-4">
            Entradas nesta escola feitas por titulares e direções pedagógicas de outras escolas do mesmo grupo (um registo por pessoa em cada 30 minutos).
          </p>
        </TabsContent>
        <TabsContent value="all" className="mt-0" />
      </Tabs>

      <DataList<ApiAuditEvent>
        prefix="auditoria"
        rows={events}
        columns={columns}
        isLoading={isLoading}
        pageSize={15}
        searchPlaceholder="Pesquisar por autor, entidade, módulo ou motivo"
        searchText={(e) =>
          `${e.actor.full_name} ${formatEntity(e.entity_type)} ${formatModule(e.module)} ${
            e.reason ?? ""
          } ${e.ip ?? ""}`
        }
        filters={[
          {
            key: "modulo",
            label: "Módulo",
            icon: "LayoutGrid",
            options: Object.keys(MODULES).map((m) => ({ value: m, label: MODULES[m] })),
            match: (e, v) => e.module === v,
          },
          {
            key: "accao",
            label: "Ação",
            icon: "Zap",
            options: Object.keys(ACTIONS).map((a) => ({ value: a, label: ACTIONS[a] })),
            match: (e, v) => e.action === v,
          },
          {
            key: "autor",
            label: "Autor da Ação",
            icon: "User",
            options: actors.map(([id, name]) => ({ value: id, label: name })),
            match: (e, v) => e.actor.id === v,
          },
          {
            key: "entidade",
            label: "Entidade",
            icon: "Database",
            options: uniqueEntities.map((m) => ({ value: m, label: formatEntity(m) })),
            match: (e, v) => e.entity_type === v,
          },
        ]}
        dateFilters={[{ key: "data", label: "Data do Registo", getDate: (e) => e.occurred_at }]}
        sorts={[
          {
            value: "data",
            label: "Data & Hora",
            compare: (a, b) => a.occurred_at.localeCompare(b.occurred_at),
          },
          {
            value: "autor",
            label: "Autor",
            compare: (a, b) => a.actor.full_name.localeCompare(b.actor.full_name, "pt"),
          },
          {
            value: "entidade",
            label: "Entidade",
            compare: (a, b) => a.entity_type.localeCompare(b.entity_type),
          },
        ]}
        emptyTitle="Sem registos de auditoria"
        emptyDescription={
          hasMore
            ? "Existem mais registos no servidor."
            : "Não foram encontrados eventos para os critérios pesquisados."
        }
        emptyIcon="ScrollText"
      />

      {hasMore && (
        <p className="text-center text-xs text-muted-foreground">
          Apresentam-se os 50 registos mais recentes; refine pela data para consultar períodos anteriores.
        </p>
      )}

      <Sheet open={isSheetOpen} onOpenChange={(v) => !v && closeModal(DETAIL_MODAL_ID)}>
        <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-xl">
          <SheetHeader className="p-0">
            <SheetTitle>Detalhes do Registo de Auditoria</SheetTitle>
            {current && (
              <SheetDescription>
                {`${formatAction(current.action, current.entity_type)} em ${formatEntity(current.entity_type)} por ${
                  current.actor.full_name
                } (${formatDateTime(current.occurred_at)})`}
              </SheetDescription>
            )}
          </SheetHeader>

          <div className="space-y-4 text-xs">
            {current?.reason && (
              <div className="rounded-xs bg-amber-500/10 border border-amber-500/20 p-3 text-amber-900 dark:text-amber-200">
                <span className="font-semibold">Justificação Formal: </span>
                <span>{current.reason}</span>
              </div>
            )}

            {!detail && <p className="text-muted-foreground p-4">A carregar detalhes da operação…</p>}

            {detail && (
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-semibold text-foreground">Estado Anterior</span>
                    <Badge variant="outline" className="text-[10px]">Antes</Badge>
                  </div>
                  <pre className="max-h-80 overflow-auto rounded-xs border border-border/50 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
                    {JSON.stringify(detail.before ?? "Nenhum estado prévio registado", null, 2)}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-semibold text-foreground">Estado Gravado</span>
                    <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">Depois</Badge>
                  </div>
                  <pre className="max-h-80 overflow-auto rounded-xs border border-border/50 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
                    {JSON.stringify(detail.after ?? "Sem alterações gravadas", null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
