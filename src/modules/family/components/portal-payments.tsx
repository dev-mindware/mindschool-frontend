"use client";

import { useMemo, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Badge, Button, ButtonOnlyAction, Checkbox, ConfirmModal, DataList, DynamicMetricCard, EmptyState, FileUpload, FormModal, FormSelect, GlobalModal, Icon, Input, FormTextarea, PROOF_ACCEPT, type Column } from "@/components";
import { usePortalPayments } from "@/modules/finance/hooks/use-tuition-payments";
import { fileToProof, tuitionPaymentsService, type ApiBankAccount, type ApiPayable, type ApiSubmission, type PaymentMethodApi } from "@/modules/finance/services/tuition-payments-service";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import { METHOD_LABEL, OPEN_SUBMISSION, SubmissionBadge } from "@/modules/finance/components/submissions/submission-status";

const PAY_MODAL = "portal-pay";
const CANCEL_MODAL = "portal-pay-cancel";
const REPLACE_MODAL = "portal-pay-replace";
const formatIban = (iban: string) => iban.replace(/(.{4})/g, "$1 ").trim();
const copy = (text: string, label: string) => navigator.clipboard.writeText(text).then(() => SucessMessage(`${label} copiado.`)).catch(() => ErrorMessage("Não foi possível copiar."));
const todayIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

/** Propinas no portal: situação, facturas por pagar, pagamento por comprovativo (dados bancários da escola) e acompanhamento. */
export function PortalPayments({ studentId, studentName }: { studentId: string; studentName: string }) {
  const pay = usePortalPayments(studentId);
  const { openModal } = useModal();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<PaymentMethodApi>("transferencia_bancaria");
  const [paidOn, setPaidOn] = useState(todayIso());
  const [bankId, setBankId] = useState("");
  const [reference, setReference] = useState("");
  const [payer, setPayer] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ApiSubmission | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<ApiSubmission | null>(null);

  const payables = pay.payables;
  const chosen = payables.filter((p) => selected[p.id]);
  const total = chosen.reduce((a, p) => a + Number(amounts[p.id] ?? p.available), 0);
  const debt = payables.reduce((a, p) => a + Number(p.balance), 0);
  const overdue = payables.filter((p) => p.is_overdue).reduce((a, p) => a + Number(p.balance), 0);
  const inReview = payables.reduce((a, p) => a + Number(p.reserved), 0);
  const next = payables.filter((p) => !p.is_overdue).sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  const toggle = (id: string, on: boolean) => setSelected((s) => ({ ...s, [id]: on }));
  const bank = pay.banks.find((b) => b.id === bankId) ?? pay.banks[0];

  const openPay = () => {
    setAmounts(Object.fromEntries(chosen.map((p) => [p.id, p.available])));
    setPaidOn(todayIso());
    setFile(null);
    setReference("");
    setNotes("");
    openModal(PAY_MODAL);
  };

  const validAmounts = chosen.every((p) => { const v = Number(amounts[p.id] ?? p.available); return v > 0 && v <= Number(p.available); });
  const canSubmit = chosen.length > 0 && validAmounts && Boolean(file) && paidOn <= todayIso();

  const submit = async () => {
    try {
      const proof = await fileToProof(file!);
      await pay.submit.mutateAsync({
        items: chosen.map((p) => ({ invoiceId: p.id, amount: Number(amounts[p.id] ?? p.available).toFixed(2) })), method, paidOn,
        ...(bank ? { bankAccountId: bank.id } : {}), ...(reference.trim() ? { reference: reference.trim() } : {}), ...(payer.trim() ? { payerName: payer.trim() } : {}), ...(notes.trim() ? { notes: notes.trim() } : {}), file: proof,
      });
      SucessMessage("Comprovativo enviado. A escola vai validar o pagamento e avisá-lo por email.");
      setSelected({});
      return true;
    } catch (e) {
      ErrorMessage(e instanceof Error && !("response" in e) ? e.message : getApiErrorMessage(e, "Não foi possível enviar o comprovativo."));
      return false;
    }
  };

  const payableColumns: Column<ApiPayable>[] = [
    { key: "select", header: "", render: (_, p) => <Checkbox checked={Boolean(selected[p.id])} disabled={Number(p.available) <= 0} onCheckedChange={(v) => toggle(p.id, v === true)} aria-label={`Seleccionar ${p.description}`} /> },
    { key: "description", header: "Factura", render: (_, p) => (<div><span className="font-medium capitalize">{p.description}</span><div className="font-mono text-[11px] text-muted-foreground">Ref. {p.payment_reference}</div></div>) },
    { key: "due_date", header: "Vencimento", render: (_, p) => <span className="text-xs">{p.due_date}</span> },
    { key: "balance", header: "Em dívida", render: (_, p) => <span className="font-semibold tabular-nums">{formatCurrency(p.balance)}</span> },
    {
      key: "state", header: "Estado",
      render: (_, p) => (
        <div className="flex flex-wrap gap-1">
          {p.is_overdue ? <Badge variant="destructive" className="font-normal">Vencida</Badge> : <Badge variant="outline" className="font-normal">Por pagar</Badge>}
          {Number(p.reserved) > 0 && <Badge variant="info" className="font-normal">{formatCurrency(p.reserved)} em análise</Badge>}
        </div>
      ),
    },
  ];

  const openProof = (s: ApiSubmission) => tuitionPaymentsService.myProofBlob(s.id).then((b) => window.open(URL.createObjectURL(b), "_blank")).catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem comprovativo.")));

  const submissionColumns: Column<ApiSubmission>[] = [
    { key: "protocol", header: "Protocolo", render: (_, s) => (<div><span className="font-mono text-xs font-semibold text-primary">{s.protocol}</span><div className="text-[11px] text-muted-foreground">{s.created_at.slice(0, 10)}</div></div>) },
    { key: "items", header: "Facturas", render: (_, s) => <span className="text-xs capitalize">{s.items.length === 1 ? s.items[0]!.description : `${s.items.length} facturas`}</span> },
    { key: "total_amount", header: "Valor", render: (_, s) => <span className="font-semibold tabular-nums">{formatCurrency(s.confirmed_amount ?? s.total_amount)}</span> },
    { key: "method", header: "Método", render: (_, s) => <span className="text-xs">{METHOD_LABEL[s.method]}</span> },
    {
      key: "status", header: "Estado",
      render: (_, s) => (
        <div className="space-y-1">
          <SubmissionBadge status={s.status} />
          {(s.status === "rejeitado" || s.status === "substituicao_pedida") && s.review_reason && <p className="max-w-[220px] text-[11px] text-muted-foreground">{s.review_reason}</p>}
        </div>
      ),
    },
    {
      key: "actions", header: "Acção",
      render: (_, s) => (
        <ButtonOnlyAction data={s} actions={[
          { label: "Ver comprovativo", icon: "Eye", onClick: openProof },
          ...(s.status === "substituicao_pedida" ? [{ label: "Enviar novo comprovativo", icon: "Upload" as const, onClick: (x: ApiSubmission) => { setReplaceTarget(x); setReplaceFile(null); openModal(REPLACE_MODAL); } }] : []),
          ...(["submetido", "substituicao_pedida"].includes(s.status) ? [{ label: "Cancelar", icon: "X" as const, variant: "destructive" as const, onClick: (x: ApiSubmission) => { setCancelTarget(x); openModal(CANCEL_MODAL); } }] : []),
        ]} />
      ),
    },
  ];

  const onReplace = async () => {
    if (!replaceFile || !replaceTarget) return;
    try {
      await pay.replace.mutateAsync({ id: replaceTarget.id, file: await fileToProof(replaceFile) });
      SucessMessage("Novo comprovativo enviado.");
      setReplaceFile(null);
    } catch (e) {
      ErrorMessage(e instanceof Error && !("response" in e) ? e.message : getApiErrorMessage(e, "Não foi possível enviar."));
      throw e;
    }
  };

  const awaiting = useMemo(() => pay.submissions.filter((s) => s.status === "substituicao_pedida"), [pay.submissions]);

  if (pay.forbidden) return <EmptyState icon="Lock" title="Sem autorização" description="Não tem autorização para consultar ou pagar o financeiro deste educando." />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={formatCurrency(debt)} subtitle="Em dívida" icon="Wallet" colors={debt > 0 ? "destructive" : "default"} description={`${payables.length} factura(s) por pagar`} />
        <DynamicMetricCard title={formatCurrency(overdue)} subtitle="Vencido" icon="TriangleAlert" colors={overdue > 0 ? "destructive" : "default"} description={overdue > 0 ? "Regularize para evitar multa de mora" : "Nada em atraso"} />
        <DynamicMetricCard title={formatCurrency(inReview)} subtitle="Em análise" icon="Hourglass" description="À espera de validação pela escola. Ainda conta como dívida e a multa pode ser criada até ser aprovado" />
        <DynamicMetricCard title={next ? next.due_date : "—"} subtitle="Próximo vencimento" icon="CalendarClock" description={next ? `${next.description} · ${formatCurrency(next.balance)}` : "Sem facturas a vencer"} />
      </div>

      {awaiting.length > 0 && (
        <div className="flex gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
          <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>A escola pediu um novo comprovativo para {awaiting.map((s) => s.protocol).join(", ")}. Use a acção «Enviar novo comprovativo» na lista abaixo.</p>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold">Facturas por pagar — {studentName}</h3>
            <p className="text-xs text-muted-foreground">Seleccione as facturas, pague por transferência e submeta o comprovativo. A escola valida e confirma por email.</p>
          </div>
          <Button className="gap-2" disabled={chosen.length === 0 || pay.banks.length === 0} onClick={openPay}>
            <Icon name="Landmark" className="size-4" />
            {chosen.length ? `Pagar ${chosen.length} factura(s) · ${formatCurrency(total)}` : "Pagar facturas"}
          </Button>
        </div>
        {pay.banks.length === 0 && <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">A escola ainda não indicou os dados bancários para pagamento online. Contacte a secretaria.</p>}
        <DataList<ApiPayable>
          prefix="pagaveis"
          rows={payables}
          columns={payableColumns}
          isLoading={pay.isLoading}
          pageSize={8}
          searchPlaceholder="Pesquisar factura"
          searchText={(p) => `${p.description} ${p.payment_reference}`}
          filters={[
            { key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "vencida", label: "Vencidas" }, { value: "porpagar", label: "Por pagar" }, { value: "analise", label: "Com comprovativo em análise" }], match: (p, v) => (v === "vencida" ? p.is_overdue : v === "porpagar" ? !p.is_overdue : Number(p.reserved) > 0) },
            { key: "tipo", label: "Tipo", icon: "Tag", options: [{ value: "propina_mensal", label: "Propinas" }, { value: "matricula", label: "Matrícula" }, { value: "servico_extra", label: "Serviços" }, { value: "multa", label: "Multas" }], match: (p, v) => p.type === v },
          ]}
          dateFilters={[{ key: "vencimento", label: "Vencimento", getDate: (p) => p.due_date }]}
          sorts={[{ value: "vencimento", label: "Vencimento", compare: (a, b) => a.due_date.localeCompare(b.due_date) }, { value: "valor", label: "Valor", compare: (a, b) => Number(a.balance) - Number(b.balance) }]}
          emptyTitle="Sem facturas por pagar"
          emptyDescription="Está tudo em dia. Obrigado!"
          emptyIcon="CircleCheck"
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold">Os meus comprovativos</h3>
        <DataList<ApiSubmission>
          prefix="meus-comprovativos"
          rows={pay.submissions}
          columns={submissionColumns}
          isLoading={pay.isLoading}
          pageSize={8}
          searchPlaceholder="Pesquisar protocolo"
          searchText={(s) => `${s.protocol} ${s.reference ?? ""}`}
          filters={[
            { key: "estado", label: "Estado", icon: "ListFilter", options: [{ value: "abertos", label: "Em curso" }, { value: "aprovado", label: "Confirmados" }, { value: "rejeitado", label: "Rejeitados" }], match: (s, v) => (v === "abertos" ? OPEN_SUBMISSION.includes(s.status) : s.status === v) },
            { key: "metodo", label: "Método", icon: "CreditCard", options: Object.entries(METHOD_LABEL).map(([value, label]) => ({ value, label })), match: (s, v) => s.method === v },
          ]}
          dateFilters={[{ key: "enviado", label: "Envio", getDate: (s) => s.created_at }]}
          sorts={[{ value: "data", label: "Data", compare: (a, b) => a.created_at.localeCompare(b.created_at) }, { value: "valor", label: "Valor", compare: (a, b) => Number(a.total_amount) - Number(b.total_amount) }]}
          emptyTitle="Ainda não enviou comprovativos"
          emptyDescription="Depois de pagar, submeta o comprovativo para a escola validar."
          emptyIcon="FileCheck"
        />
      </section>

      <FormModal id={REPLACE_MODAL} title="Enviar novo comprovativo" description={replaceTarget ? `Substitui o comprovativo ${replaceTarget.protocol}.` : undefined} submitLabel="Enviar" size="sm" isLoading={pay.replace.isPending} disabled={!replaceFile} onSubmit={onReplace}>
        <FileUpload className="sm:col-span-2" value={replaceFile} onChange={setReplaceFile} accept={PROOF_ACCEPT} maxBytes={8 * 1024 * 1024} label="Anexar o novo comprovativo" />
      </FormModal>

      <GlobalModal
        id={PAY_MODAL}
        size="3xl"
        icon={<Icon name="Landmark" className="size-5" />}
        title="Pagar propinas"
        description={`${studentName} · ${chosen.length} factura(s)`}
        preventOutsideClose
        footer={
          <>
            <ModalCancel />
            <Button type="button" disabled={!canSubmit || pay.submit.isPending} className="gap-2" onClick={() => void submit().then((ok) => ok && useModal.getState().closeModal(PAY_MODAL))}>
              {pay.submit.isPending && <Icon className="animate-spin" name="LoaderCircle" />}Submeter comprovativo · {formatCurrency(total)}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold"><span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">1</span>Faça a transferência para a escola</h4>
            <div className="grid gap-3 sm:grid-cols-2">{pay.banks.map((b) => <BankCard key={b.id} bank={b} active={b.id === (bank?.id ?? "")} onPick={() => setBankId(b.id)} multiple={pay.banks.length > 1} />)}</div>
            <p className="text-xs text-muted-foreground">Na descrição da transferência indique <strong>o nome do aluno</strong> e a referência: <span className="font-mono">{chosen.map((p) => p.payment_reference).join(", ")}</span>. Total: <strong>{formatCurrency(total)}</strong>.</p>
          </section>

          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold"><span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">2</span>Submeta o comprovativo</h4>
            <p className="text-xs text-muted-foreground">Pode pagar menos do que está em dívida em cada factura: fica como pagamento parcial e o resto continua por pagar. A escola confirma o valor e só então o pagamento fica registado.</p>
            <ul className="divide-y rounded-lg border">
              {chosen.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="capitalize">{p.description}<span className="block text-xs text-muted-foreground normal-case">em dívida {formatCurrency(p.available)}</span></span>
                  <div className="w-40"><Input label="" type="number" value={amounts[p.id] ?? p.available} onChange={(e) => setAmounts((a) => ({ ...a, [p.id]: e.target.value }))} error={Number(amounts[p.id] ?? p.available) > Number(p.available) ? "Excede o valor em dívida" : undefined} /></div>
                </li>
              ))}
            </ul>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect label="Como pagou" value={method} onValueChange={(v) => setMethod(v as PaymentMethodApi)} options={Object.entries(METHOD_LABEL).map(([value, label]) => ({ value, label }))} />
              <Input label="Data do pagamento" type="date" value={paidOn} max={todayIso()} onChange={(e) => setPaidOn(e.target.value)} />
              <Input label="Referência da transferência" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="N.º da operação (opcional)" />
              <Input label="Nome do ordenante" value={payer} onChange={(e) => setPayer(e.target.value)} placeholder="Quem fez o pagamento (opcional)" />
            </div>
            <FormTextarea label="Nota para a escola" value={notes} onChange={setNotes} rows={2} />
            <FileUpload value={file} onChange={setFile} accept={PROOF_ACCEPT} maxBytes={8 * 1024 * 1024} label="Anexar o comprovativo" hint="PDF, PNG ou JPEG · máximo 8 MB. Use uma imagem nítida com valor, data e referência." />
          </section>
        </div>
      </GlobalModal>

      <ConfirmModal id={CANCEL_MODAL} title="Cancelar comprovativo" description={cancelTarget ? `Cancelar o comprovativo ${cancelTarget.protocol}? As facturas voltam a ficar disponíveis para pagamento.` : ""} destructive confirmLabel="Cancelar comprovativo"
        onConfirm={() => (cancelTarget ? pay.cancel.mutateAsync(cancelTarget.id).then(() => { SucessMessage("Comprovativo cancelado."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível cancelar.")); throw e; }) : Promise.resolve())} />
    </div>
  );
}

function ModalCancel() {
  const { closeModal } = useModal();
  return <Button type="button" variant="outline" onClick={() => closeModal(PAY_MODAL)}>Cancelar</Button>;
}

function BankCard({ bank, active, onPick, multiple }: { bank: ApiBankAccount; active: boolean; onPick: () => void; multiple: boolean }) {
  return (
    <div role={multiple ? "button" : undefined} onClick={multiple ? onPick : undefined} className={`rounded-lg border p-3 text-sm ${multiple ? "cursor-pointer" : ""} ${active ? "border-primary bg-primary/5" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{bank.bank_name}</span>
        {multiple && <span className={`size-3 rounded-full border ${active ? "border-primary bg-primary" : ""}`} />}
      </div>
      <p className="text-xs text-muted-foreground">{bank.account_holder}</p>
      <button type="button" onClick={(e) => { e.stopPropagation(); void copy(bank.iban, "IBAN"); }} className="mt-2 flex w-full items-center justify-between gap-2 rounded-md bg-muted/50 px-2 py-1.5 font-mono text-xs hover:bg-muted">
        {formatIban(bank.iban)}<Icon name="Copy" className="size-3.5 shrink-0" />
      </button>
      {bank.account_number && <p className="mt-1 text-xs text-muted-foreground">Conta: <span className="font-mono">{bank.account_number}</span></p>}
      {bank.instructions && <p className="mt-1 text-xs">{bank.instructions}</p>}
    </div>
  );
}
