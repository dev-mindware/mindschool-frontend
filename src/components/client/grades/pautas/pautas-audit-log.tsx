'use client';

import { Badge, DataList, Icon, type Column } from '@/components';
import { PautaAuditEntry } from '@/types/grade';

interface PautasAuditLogProps {
  auditLogs: PautaAuditEntry[];
}

const ACTION_LABEL: Record<PautaAuditEntry['action'], string> = { CLOSED: 'Fecho homologado', REOPENED: 'Reabertura auditada', GRADE_MODIFIED: 'Nota alterada' };
const uniq = (v: string[]) => [...new Set(v.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt'));

/** Livro de auditoria pedagógica: fechos, reaberturas e alterações de pauta. */
export function PautasAuditLogSection({ auditLogs }: PautasAuditLogProps) {
  if (!auditLogs || auditLogs.length === 0) return null;

  const columns: Column<PautaAuditEntry>[] = [
    { key: 'timestamp', header: 'Data e hora', render: (_, l) => <span className="font-mono text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString('pt-AO')}</span> },
    { key: 'sectionName', header: 'Turma', render: (_, l) => <span className="font-medium">{l.sectionName}</span> },
    { key: 'action', header: 'Acção', render: (_, l) => <Badge variant={l.action === 'CLOSED' ? 'default' : 'warning'} className="text-[10px] font-normal">{ACTION_LABEL[l.action]}</Badge> },
    { key: 'userName', header: 'Responsável', render: (_, l) => <span className="font-medium">{l.userName}</span> },
    { key: 'reason', header: 'Justificativa', render: (_, l) => <span className="line-clamp-2 max-w-xs text-xs text-muted-foreground" title={l.reason}>{l.reason}</span> },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <Icon name="ShieldAlert" className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Livro de Auditoria Pedagógica (fechos e reaberturas)</h3>
      </div>
      <DataList<PautaAuditEntry>
        prefix="auditoria-pautas"
        rows={auditLogs}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Pesquisar turma, responsável ou motivo"
        searchText={(l) => `${l.sectionName} ${l.userName} ${l.reason}`}
        filters={[
          { key: 'accao', label: 'Acção', icon: 'ListFilter', options: Object.entries(ACTION_LABEL).map(([value, label]) => ({ value, label })), match: (l, v) => l.action === v },
          { key: 'turma', label: 'Turma', icon: 'Users', options: uniq(auditLogs.map((l) => l.sectionName)).map((v) => ({ value: v, label: v })), match: (l, v) => l.sectionName === v },
          { key: 'responsavel', label: 'Responsável', icon: 'UserCheck', options: uniq(auditLogs.map((l) => l.userName)).map((v) => ({ value: v, label: v })), match: (l, v) => l.userName === v },
        ]}
        dateFilters={[{ key: 'data', label: 'Data', getDate: (l) => l.timestamp }]}
        sorts={[{ value: 'data', label: 'Data', compare: (a, b) => a.timestamp.localeCompare(b.timestamp) }]}
        emptyTitle="Sem registos"
        emptyDescription="Ainda não há fechos ou reaberturas."
        emptyIcon="ShieldAlert"
      />
    </div>
  );
}
