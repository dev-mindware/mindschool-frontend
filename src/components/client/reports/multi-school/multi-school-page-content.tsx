'use client';
import { formatCurrencyCompact } from "@/utils";

import { useState } from 'react';
import { SucessMessage, ErrorMessage } from '@/utils/messages';
import { Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, DynamicMetricCard, EmptyState, FormModal, FormSelect, Icon, Input, TitleList, type Column } from '@/components';
import { useGroups } from '@/hooks/school/use-groups';
import { GROUP_ROLE_LABEL, type ApiGroupMember, type GroupRole } from '@/services/groups-service';
import { useModal } from '@/stores/modal/use-modal-store';
import { getApiErrorMessage } from '@/utils/api-error';

const pct = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `${v}%`);
const fail = (e: unknown, fallback = 'A operação falhou.') => { ErrorMessage(getApiErrorMessage(e, fallback)); throw e; };
const ROLE_OPTIONS = (Object.keys(GROUP_ROLE_LABEL) as GroupRole[]).map((r) => ({ value: r, label: GROUP_ROLE_LABEL[r] }));

type SchoolRow = { id: string } & Record<string, unknown>;
type MemberRow = ApiGroupMember & { id: string };

/** Painel do grupo educativo: indicadores agregados por escola (sem dados nominais), consoante o papel no grupo. */
export function MultiSchoolPageContent() {
  const [groupId, setGroupId] = useState('');
  const first = useGroups();
  const active = groupId || first.groups[0]?.id || '';
  const g = useGroups(active || undefined);
  const { openModal } = useModal();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<GroupRole>('group_viewer');
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [editRole, setEditRole] = useState<GroupRole>('group_viewer');
  const [removing, setRemoving] = useState<MemberRow | null>(null);

  if (first.isLoading) return <div className="text-sm text-muted-foreground">A carregar…</div>;
  if (first.groups.length === 0) {
    return <EmptyState icon="Building2" title="Sem grupo educativo" description="Não pertence a nenhum grupo educativo. O grupo e os seus membros são criados pela equipa da plataforma." />;
  }

  const d = g.dashboard;
  const t = d?.totals;
  const hasStudents = t?.enrolled !== undefined;
  const hasMoney = t?.invoiced !== undefined;

  const schools = (d?.schools ?? []).map((s) => ({ ...s, id: s.school.id })) as unknown as Array<SchoolRow & (typeof d extends undefined ? never : NonNullable<typeof d>['schools'][number])>;
  const schoolColumns: Column<(typeof schools)[number]>[] = [
    { key: 'school', header: 'Escola', render: (_, s) => <span className="font-medium">{s.school.name}{s.provisional && <Badge variant="warning" className="ml-2 text-[10px]">Provisório</Badge>}</span> },
    ...(hasStudents ? [
      { key: 'enrolled', header: 'Alunos', render: (_: unknown, s: (typeof schools)[number]) => <span className="font-mono">{s.enrolled ?? '—'}</span> },
      { key: 'approval_rate', header: 'Aprovação', render: (_: unknown, s: (typeof schools)[number]) => <span className="font-mono">{pct(s.approval_rate)}</span> },
      { key: 'dropout_rate', header: 'Abandono', render: (_: unknown, s: (typeof schools)[number]) => <span className="font-mono">{pct(s.dropout_rate)}</span> },
    ] : []),
    ...(hasMoney ? [
      { key: 'invoiced', header: 'Facturado', render: (_: unknown, s: (typeof schools)[number]) => <span className="font-mono">{formatCurrencyCompact(s.invoiced)}</span> },
      { key: 'collected', header: 'Cobrado', render: (_: unknown, s: (typeof schools)[number]) => <span className="font-mono">{formatCurrencyCompact(s.collected)}</span> },
      { key: 'collection_rate', header: 'Cobrança', render: (_: unknown, s: (typeof schools)[number]) => <span className="font-mono">{pct(s.collection_rate)}</span> },
      { key: 'delinquency_rate', header: 'Inadimplência', render: (_: unknown, s: (typeof schools)[number]) => <span className="font-mono">{pct(s.delinquency_rate)}</span> },
    ] : []),
  ];

  const members: MemberRow[] = g.members.map((m) => ({ ...m, id: m.user_id }));
  const memberColumns: Column<MemberRow>[] = [
    { key: 'full_name', header: 'Membro', render: (_, m) => (<div><p className="text-sm font-medium">{m.full_name}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>) },
    { key: 'role', header: 'Papel', render: (_, m) => <Badge variant="outline">{GROUP_ROLE_LABEL[m.role]}</Badge> },
    { key: 'granted_at', header: 'Desde', render: (_, m) => <span className="text-xs">{m.granted_at.slice(0, 10)}</span> },
    {
      key: 'actions',
      header: 'Acção',
      render: (_, m) => (
        <ButtonOnlyAction data={m} actions={[
          { label: 'Alterar papel', icon: 'UserCog', onClick: (x) => { setEditing(x); setEditRole(x.role); openModal('group-member-role'); } },
          { label: 'Remover', icon: 'Trash2', variant: 'destructive', onClick: (x) => { setRemoving(x); openModal('group-member-remove'); } },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Painel Multi-Escola" suTitle="Indicadores consolidados do grupo, lidos de uma vista agregada (sem dados nominais de alunos).">
        <div className="flex items-end gap-2">
          {first.groups.length > 1 && <div className="w-56"><FormSelect label="Grupo" value={active} onValueChange={setGroupId} options={first.groups.map((x) => ({ value: x.id, label: x.name }))} /></div>}
          {g.canRefresh && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled={g.refresh.isPending} onClick={() => g.refresh.mutateAsync().then(() => SucessMessage('Indicadores recalculados.')).catch((e) => ErrorMessage(getApiErrorMessage(e, 'A operação falhou.')))}>
              <Icon name="RefreshCw" className="size-4" />Recalcular
            </Button>
          )}
        </div>
      </TitleList>

      {g.group && <p className="text-xs text-muted-foreground">O seu papel: <strong>{GROUP_ROLE_LABEL[g.group.role]}</strong>{d?.computed_at ? ` • dados de ${new Date(d.computed_at).toLocaleString('pt-AO')}` : ''}</p>}

      {t && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
          <DynamicMetricCard title={`${t.schools}`} subtitle="Escolas do Grupo" description={t.provisional_schools ? `${t.provisional_schools} com dados provisórios` : 'Dados consolidados'} icon="Building2" />
          {hasStudents && <DynamicMetricCard title={`${t.enrolled}`} subtitle="Alunos Matriculados" description={`Aprovação ${pct(t.approval_rate)} • abandono ${pct(t.dropout_rate)}`} icon="Users" />}
          {hasMoney && <DynamicMetricCard title={formatCurrencyCompact(t.collected)} subtitle="Cobrado" description={`de ${formatCurrencyCompact(t.invoiced)} facturados`} icon="Wallet" />}
          {t.collection_rate !== undefined && <DynamicMetricCard title={pct(t.collection_rate)} subtitle="Taxa de Cobrança" description={`Inadimplência ${pct(t.delinquency_rate)}`} icon="TrendingUp" />}
        </div>
      )}

      {d && (
        <DataList
          prefix="escolas"
          rows={schools}
          columns={schoolColumns}
          isLoading={g.dashboardLoading}
          pageSize={10}
          searchPlaceholder="Pesquisar escola"
          searchText={(s) => s.school.name}
          filters={[{ key: 'dados', label: 'Dados', icon: 'ListFilter', options: [{ value: 'provisorio', label: 'Provisórios' }, { value: 'consolidado', label: 'Consolidados' }], match: (s, v) => (v === 'provisorio' ? Boolean(s.provisional) : !s.provisional) }]}
          sorts={[
            { value: 'nome', label: 'Escola', compare: (a, b) => a.school.name.localeCompare(b.school.name, 'pt') },
            ...(hasStudents ? [{ value: 'alunos', label: 'Alunos', compare: (a: (typeof schools)[number], b: (typeof schools)[number]) => (a.enrolled ?? 0) - (b.enrolled ?? 0) }] : []),
            ...(hasMoney ? [{ value: 'cobranca', label: 'Taxa de cobrança', compare: (a: (typeof schools)[number], b: (typeof schools)[number]) => (a.collection_rate ?? 0) - (b.collection_rate ?? 0) }] : []),
          ]}
          emptyTitle="Sem escolas"
          emptyDescription="O grupo ainda não tem escolas associadas."
          emptyIcon="Building2"
        />
      )}

      {g.canManage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Membros do grupo</h3>
              <p className="text-[11px] text-muted-foreground">Só se adicionam utilizadores que já têm conta; não pode alterar o seu próprio papel.</p>
            </div>
            <Button size="sm" className="gap-1.5" onClick={() => openModal('group-member-add')}><Icon name="UserPlus" className="size-4" />Adicionar membro</Button>
          </div>
          <DataList<MemberRow>
            prefix="membros"
            rows={members}
            columns={memberColumns}
            pageSize={10}
            searchPlaceholder="Pesquisar por nome ou e-mail"
            searchText={(m) => `${m.full_name} ${m.email}`}
            filters={[{ key: 'papel', label: 'Papel', icon: 'UserCog', options: ROLE_OPTIONS, match: (m, v) => m.role === v }]}
            dateFilters={[{ key: 'desde', label: 'Desde', getDate: (m) => m.granted_at }]}
            sorts={[{ value: 'nome', label: 'Nome', compare: (a, b) => a.full_name.localeCompare(b.full_name, 'pt') }, { value: 'desde', label: 'Data', compare: (a, b) => a.granted_at.localeCompare(b.granted_at) }]}
            emptyTitle="Sem membros"
            emptyDescription="Adicione o primeiro membro do grupo."
            emptyIcon="Users"
          />
        </div>
      )}

      <FormModal id="group-member-add" title="Adicionar membro" description="O utilizador já tem de ter conta na plataforma." submitLabel="Adicionar" isLoading={g.addMember.isPending} disabled={!email.includes('@')}
        onSubmit={() => g.addMember.mutateAsync({ email: email.trim(), role }).then(() => { SucessMessage('Membro adicionado.'); setEmail(''); }).catch((e) => fail(e))}>
        <div className="sm:col-span-2"><Input label="E-mail do utilizador *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="sm:col-span-2"><FormSelect label="Papel" value={role} onValueChange={(v) => setRole(v as GroupRole)} options={ROLE_OPTIONS} /></div>
      </FormModal>

      <FormModal id="group-member-role" title="Alterar papel" description={editing?.full_name} submitLabel="Guardar" isLoading={g.setRole.isPending}
        onSubmit={() => (editing ? g.setRole.mutateAsync({ userId: editing.user_id, role: editRole }).then(() => { SucessMessage('Papel actualizado.'); }).catch((e) => fail(e)) : undefined)}>
        <div className="sm:col-span-2"><FormSelect label="Papel" value={editRole} onValueChange={(v) => setEditRole(v as GroupRole)} options={ROLE_OPTIONS} /></div>
      </FormModal>

      <ConfirmModal id="group-member-remove" title="Remover membro" description={removing ? `Remover ${removing.full_name} do grupo?` : ''} destructive confirmLabel="Remover"
        onConfirm={() => (removing ? g.removeMember.mutateAsync(removing.user_id).then(() => { SucessMessage('Membro removido.'); }).catch((e) => fail(e)) : Promise.resolve())} />
    </div>
  );
}
