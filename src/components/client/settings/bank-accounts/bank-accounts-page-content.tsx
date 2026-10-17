"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, ConfirmModal, DataList, FormModal, FormTextarea, Icon, Input, TitleList, type Column } from "@/components";
import { useBankAccounts } from "@/modules/finance/hooks/use-tuition-payments";
import type { ApiBankAccount } from "@/modules/finance/services/tuition-payments-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const MODAL = "bank-account-form";
const DEACTIVATE = "bank-account-deactivate";

import { validIban } from "@/schemas/helps";

/** IBAN em grupos de 4 para leitura (a API guarda sem espaços). */
export const formatIban = (iban: string) => iban.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();

const copy = (text: string, label: string) => navigator.clipboard.writeText(text).then(() => SucessMessage(`${label} copiado.`)).catch(() => ErrorMessage("Não foi possível copiar."));

/** Dados bancários da escola: ficam visíveis no portal do encarregado/aluno para o pagamento por transferência. */
export function BankAccountsPageContent() {
  const { accounts, isLoading, isError, create, update } = useBankAccounts();
  const { openModal } = useModal();
  const [editing, setEditing] = useState<ApiBankAccount | null>(null);
  const [target, setTarget] = useState<ApiBankAccount | null>(null);
  const [form, setForm] = useState({ bankName: "", accountHolder: "", iban: "", accountNumber: "", swift: "", instructions: "" });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const openNew = () => { setEditing(null); setForm({ bankName: "", accountHolder: "", iban: "", accountNumber: "", swift: "", instructions: "" }); openModal(MODAL); };
  const openEdit = (a: ApiBankAccount) => {
    setEditing(a);
    setForm({ bankName: a.bank_name, accountHolder: a.account_holder, iban: formatIban(a.iban), accountNumber: a.account_number ?? "", swift: a.swift ?? "", instructions: a.instructions ?? "" });
    openModal(MODAL);
  };

  const ibanOk = validIban(form.iban);
  const canSave = form.bankName.trim().length >= 2 && form.accountHolder.trim().length >= 3 && ibanOk;
  const fail = (e: unknown): never => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar.")); throw e; };

  const save = () => {
    const data = { bankName: form.bankName.trim(), accountHolder: form.accountHolder.trim(), iban: form.iban.replace(/\s+/g, "").toUpperCase(), accountNumber: form.accountNumber.trim() || undefined, swift: form.swift.trim().toUpperCase() || undefined, instructions: form.instructions.trim() };
    return (editing ? update.mutateAsync({ id: editing.id, data }) : create.mutateAsync(data)).then(() => { SucessMessage("Dados bancários guardados. O titular foi avisado por email."); }).catch(fail);
  };

  const columns: Column<ApiBankAccount>[] = [
    { key: "bank_name", header: "Banco", render: (_, a) => (<div><span className="font-medium">{a.bank_name}</span><div className="text-xs text-muted-foreground">{a.account_holder}</div></div>) },
    {
      key: "iban", header: "IBAN",
      render: (_, a) => (
        <button type="button" onClick={() => void copy(a.iban, "IBAN")} className="group flex items-center gap-2 font-mono text-xs hover:text-primary" title="Copiar IBAN">
          {formatIban(a.iban)}<Icon name="Copy" className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      ),
    },
    { key: "account_number", header: "N.º de conta", render: (_, a) => <span className="font-mono text-xs">{a.account_number ?? "—"}</span> },
    { key: "instructions", header: "Instruções ao pagador", render: (_, a) => <span className="line-clamp-2 max-w-xs text-xs text-muted-foreground">{a.instructions || "—"}</span> },
    { key: "is_active", header: "Estado", render: (_, a) => <Badge variant={a.is_active ? "success" : "secondary"}>{a.is_active ? "Visível no portal" : "Inactiva"}</Badge> },
    {
      key: "actions", header: "Acção",
      render: (_, a) => (
        <ButtonOnlyAction data={a} actions={[
          { permission: "bank_account:write", label: "Editar", icon: "Pencil", onClick: openEdit },
          a.is_active
            ? { permission: "bank_account:write", label: "Esconder do portal", icon: "EyeOff", variant: "destructive", onClick: (x) => { setTarget(x); openModal(DEACTIVATE); } }
            : { permission: "bank_account:write", label: "Mostrar no portal", icon: "Eye", onClick: (x) => void update.mutateAsync({ id: x.id, data: { isActive: true } }).then(() => SucessMessage("Conta visível no portal.")).catch(fail) },
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Dados bancários" suTitle="Contas para onde as famílias transferem as propinas. Ficam visíveis no portal, junto de cada pagamento.">
        <Can permission="bank_account:write"><Button size="sm" className="gap-2" onClick={openNew}><Icon name="Plus" className="size-4" />Adicionar conta</Button></Can>
      </TitleList>

      <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-900 dark:text-amber-200">
        <Icon name="ShieldAlert" className="mt-0.5 size-4 shrink-0" />
        <p>Qualquer alteração a estas contas é auditada e o titular recebe um email de aviso. Confirme sempre o IBAN antes de guardar: um IBAN errado desvia os pagamentos das famílias.</p>
      </div>

      <DataList<ApiBankAccount>
        prefix="contas"
        rows={accounts}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        pageSize={10}
        searchPlaceholder="Pesquisar banco, titular ou IBAN"
        searchText={(a) => `${a.bank_name} ${a.account_holder} ${a.iban} ${a.account_number ?? ""}`}
        filters={[{ key: "estado", label: "Estado", icon: "ToggleLeft", options: [{ value: "on", label: "Visíveis no portal" }, { value: "off", label: "Inactivas" }], match: (a, v) => (v === "on" ? a.is_active : !a.is_active) }]}
        sorts={[{ value: "banco", label: "Banco", compare: (a, b) => a.bank_name.localeCompare(b.bank_name, "pt") }, { value: "ordem", label: "Ordem", compare: (a, b) => a.sort_order - b.sort_order }]}
        emptyTitle="Ainda não há contas bancárias"
        emptyDescription="Adicione a conta da escola para que os encarregados vejam onde pagar."
        emptyIcon="Landmark"
      />

      <FormModal id={MODAL} title={editing ? "Editar conta bancária" : "Nova conta bancária"} description="O IBAN é validado (formato angolano e dígitos de controlo)." submitLabel="Guardar" size="md" isLoading={create.isPending || update.isPending} disabled={!canSave} onSubmit={save}>
        <Input label="Banco *" value={form.bankName} onChange={set("bankName")} placeholder="Ex: BAI, BFA, BIC, Atlântico" />
        <Input label="Titular da conta *" value={form.accountHolder} onChange={set("accountHolder")} placeholder="Nome da escola/entidade" />
        <div className="sm:col-span-2"><Input label="IBAN *" value={form.iban} onChange={(e) => setForm((f) => ({ ...f, iban: formatIban(e.target.value.toUpperCase()) }))} placeholder="AO06 0006 0000 0123 4567 8910 1" error={form.iban && !ibanOk ? "IBAN inválido (AO + 23 dígitos, com dígitos de controlo correctos)" : undefined} /></div>
        <Input label="N.º de conta" value={form.accountNumber} onChange={set("accountNumber")} />
        <Input label="SWIFT / BIC" value={form.swift} onChange={set("swift")} />
        <div className="sm:col-span-2"><FormTextarea label="Instruções ao pagador" value={form.instructions} onChange={(v) => setForm((f) => ({ ...f, instructions: v }))} rows={2} placeholder="Ex: Indique o nome do aluno e o n.º de processo na descrição." /></div>
      </FormModal>

      <ConfirmModal id={DEACTIVATE} title="Esconder conta do portal" description={target ? `A conta ${target.bank_name} deixa de aparecer às famílias. Pode voltar a mostrá-la quando quiser.` : ""} destructive confirmLabel="Esconder"
        onConfirm={() => (target ? update.mutateAsync({ id: target.id, data: { isActive: false } }).then(() => { SucessMessage("Conta escondida do portal."); }).catch(fail) : Promise.resolve())} />
    </div>
  );
}
