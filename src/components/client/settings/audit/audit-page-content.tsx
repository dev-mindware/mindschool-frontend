"use client";

import { formatDateTime } from "@/utils";
import { useState } from "react";
import {
  Badge,
  Button,
  ButtonOnlyAction,
  DataList,
  EmptyState,
  FormModal,
  Icon,
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
  financeiro: "Tesouraria & Facturação",
  documentos: "Secretaria & Arquivo",
  organizacao: "Organização Escolar",
  comunicacao: "Comunicação & Notificações",
  relatorios: "Relatórios & Mapas MED",
};

/** Acções de auditoria em conformidade com o AO1945. */
const ACTIONS: Record<string, string> = {
  criacao: "Criação",
  actualizacao: "Actualização",
  fecho: "Fecho / Homologação",
  reabertura: "Reabertura",
  anulacao: "Anulação",
};

/** Entidades institucionais traduzidas. */
const ENTITIES: Record<string, string> = {
  invoice: "Factura / Propina",
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
};

const formatModule = (m: string) => MODULES[m] ?? (m.charAt(0).toUpperCase() + m.slice(1));
const formatAction = (a: string) => ACTIONS[a] ?? (a.charAt(0).toUpperCase() + a.slice(1));
const formatEntity = (e: string) => ENTITIES[e] ?? e;

type Detail = { before?: unknown; after?: unknown; reason?: string | null };

/** Registo imutável de auditoria da escola em português de Angola (AO1945). */
export function AuditPageContent() {
  // «Acessos do grupo»: quem entrou nesta escola a partir de outra do grupo (titular/direcção pedagógica).
  const [groupOnly, setGroupOnly] = useState(false);
  const { events, hasMore, isLoading, forbidden } = useAudit(groupOnly ? { entity_type: "group_access" } : {});
  const { openModal } = useModal();
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

  const open = (e: ApiAuditEvent) => {
    setCurrent(e);
    setDetail(null);
    openModal("settings-audit-detail");
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
      header: "Autor da Acção",
      render: (_, e) => (
        <span className="font-semibold text-foreground text-xs">{e.actor.full_name}</span>
      ),
    },
    {
      key: "action",
      header: "Acção Realizada",
      render: (_, e) => {
        const isDanger = e.action === "anulacao";
        const isSuccess = e.action === "criacao" || e.action === "fecho";
        return (
          <Badge
            variant="outline"
            className={
              isDanger
                ? "border-destructive/30 bg-destructive/10 text-destructive text-[10px]"
                : isSuccess
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px]"
                : "border-primary/30 bg-primary/10 text-primary text-[10px]"
            }
          >
            {formatAction(e.action)}
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
          actions={[{ label: "Consultar Registo", icon: "Eye", onClick: open }]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList
        title="Livro de Auditoria e Rastreabilidade"
        suTitle="Registo imutável de todas as acções e actualizações institucionais da escola; em conformidade com a norma ortográfica AO1945."
      />

      <div className="inline-flex rounded-md border bg-sidebar p-1" role="tablist" aria-label="Tipo de registo">
        <Button size="sm" variant={groupOnly ? "ghost" : "default"} className="h-8 gap-1.5" onClick={() => setGroupOnly(false)}>
          <Icon name="ScrollText" className="size-4" />Todos os registos
        </Button>
        <Button size="sm" variant={groupOnly ? "default" : "ghost"} className="h-8 gap-1.5" onClick={() => setGroupOnly(true)}>
          <Icon name="Building2" className="size-4" />Acessos do grupo
        </Button>
      </div>
      {groupOnly && (
        <p className="text-xs text-muted-foreground">
          Entradas nesta escola feitas por titulares e direcções pedagógicas de outras escolas do mesmo grupo (um registo por pessoa em cada 30 minutos).
        </p>
      )}

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
            label: "Acção",
            icon: "Zap",
            options: Object.keys(ACTIONS).map((a) => ({ value: a, label: ACTIONS[a] })),
            match: (e, v) => e.action === v,
          },
          {
            key: "autor",
            label: "Autor da Acção",
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

      {/* Modal de Detalhe de Auditoria (Padrão MindGest w-max, sem bordas internas) */}
      <FormModal
        id="settings-audit-detail"
        title="Detalhes do Registo de Auditoria"
        description={
          current
            ? `${formatAction(current.action)} em ${formatEntity(current.entity_type)} por ${
                current.actor.full_name
              } (${formatDateTime(current.occurred_at)})`
            : undefined
        }
        size="lg"
        readOnly
        onSubmit={() => undefined}
      >
        <div className="sm:col-span-2 space-y-4 text-xs">
          {current?.reason && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-900 dark:text-amber-200">
              <span className="font-semibold">Justificação Formal: </span>
              <span>{current.reason}</span>
            </div>
          )}

          {!detail && <p className="text-muted-foreground p-4">A carregar detalhes da operação…</p>}

          {detail && (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-semibold text-foreground">Estado Anterior</span>
                  <Badge variant="outline" className="text-[10px]">Antes</Badge>
                </div>
                <pre className="max-h-80 overflow-auto rounded-lg border border-border/50 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
                  {JSON.stringify(detail.before ?? "Nenhum estado prévio registado", null, 2)}
                </pre>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="font-semibold text-foreground">Estado Gravado</span>
                  <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">Depois</Badge>
                </div>
                <pre className="max-h-80 overflow-auto rounded-lg border border-border/50 bg-muted/40 p-3 font-mono text-[11px] leading-relaxed">
                  {JSON.stringify(detail.after ?? "Sem alterações gravadas", null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </FormModal>
    </div>
  );
}
