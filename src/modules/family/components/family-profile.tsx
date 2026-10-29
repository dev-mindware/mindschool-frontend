"use client";
import { formatIsoDay } from "@/utils/format-date";
import { familyKeys } from "@/modules/family/query-keys";
import { formatDateTime } from "@/utils";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, FormModal, Icon, Input } from "@/components";
import { portalService } from "@/modules/family/services/portal-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const MODAL = "family-profile-edit";
const Row = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b py-2.5 text-sm last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right font-medium">{value}{hint && <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span>}</span>
  </div>
);

/** Perfil do encarregado/aluno (aba «Perfil» das Configurações): dados pessoais com contactos editáveis e dados da conta. A segurança fica na aba «Segurança». */
export function FamilyProfile() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const { openModal } = useModal();
  const { data: me, isLoading } = useQuery({ queryKey: familyKeys.profile(schoolId), queryFn: portalService.profile, enabled: Boolean(schoolId), staleTime: 30 * 1000 });
  const save = useMutation({ mutationFn: portalService.updateContacts, onSuccess: (p) => qc.setQueryData(familyKeys.profile(schoolId), p) });
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  if (isLoading || !me) return <p className="text-sm text-muted-foreground">A carregar…</p>;
  const person = me.guardian ?? me.student;
  const canEdit = me.editable.phone || me.editable.email;
  const edit = () => { setPhone(me.guardian?.phone ?? ""); setEmail(me.guardian?.email ?? ""); openModal(MODAL); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Perfil</h2>
        <p className="mt-1 text-xs text-muted-foreground">Os seus dados na escola e os contactos que ela usa para os avisos.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xs border bg-card p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold"><Icon name="User" className="size-4 text-primary" />Dados pessoais</h3>
            {canEdit && <Button size="sm" variant="outline" className="gap-1.5" onClick={edit}><Icon name="Pencil" className="size-3.5" />Editar contactos</Button>}
          </div>
          <Row label="Nome" value={person?.full_name ?? me.user.full_name} />
          {me.guardian && (
            <>
              <Row label="Telefone" value={me.guardian.phone} />
              <Row label="Email de contacto" value={me.guardian.email ?? "—"} hint="usado pela escola nos avisos" />
              <Row label="Documento" value={me.guardian.document_number} />
            </>
          )}
          {me.student && !me.guardian && (
            <>
              <Row label="Data de nascimento" value={formatIsoDay(me.student.birth_date)} />
              <Row label="Documento" value={me.student.document_number} />
            </>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Para corrigir o nome, o documento ou outros dados da escola, faça um pedido em «Documentos e Pedidos» (tipo «Outro requerimento»).</p>
        </section>

        <section className="rounded-xs border bg-card p-5">
          <h3 className="mb-2 flex items-center gap-2 text-base font-semibold"><Icon name="ShieldCheck" className="size-4 text-primary" />Conta de acesso</h3>
          <Row label="Email de acesso" value={me.user.email} />
          <Row label="Último acesso" value={me.user.last_login_at ? formatDateTime(me.user.last_login_at) : "—"} />
          <div className="flex items-center justify-between gap-2 py-2.5 text-sm"><span className="text-muted-foreground">Verificação em dois passos</span><Badge variant={me.user.mfa_enabled ? "success" : "secondary"} className="font-normal">{me.user.mfa_enabled ? "Ativa" : "Desativada"}</Badge></div>
          <p className="mt-2 text-xs text-muted-foreground">Palavra-passe, verificação em dois passos e sessões gerem-se na aba «Segurança».</p>
        </section>
      </div>

      <FormModal id={MODAL} title="Editar contactos" description="O telefone e o email de contacto são usados pela escola para os avisos e a cobrança." submitLabel="Guardar" isLoading={save.isPending} disabled={phone.trim().length < 7}
        onSubmit={() => save.mutateAsync({ phone: phone.trim(), email: email.trim() ? email.trim() : null }).then(() => { SucessMessage("Contactos atualizados."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar.")); throw e; })}>
        <div className="sm:col-span-2"><Input label="Telefone *" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+244 923 000 000" /></div>
        <div className="sm:col-span-2"><Input label="Email de contacto" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@dominio.ao" /></div>
        <p className="sm:col-span-2 text-xs text-muted-foreground">Isto não altera o email que usa para entrar na conta.</p>
      </FormModal>
    </div>
  );
}
