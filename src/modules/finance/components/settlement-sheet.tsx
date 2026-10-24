"use client";

import React, { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/common/icon";
import { ErrorMessage, SucessMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import { isValidNif, normalizeNif } from "@/lib/nif";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { financeKeys } from "@/modules/finance/query-keys";
import type { StudentTuitionFee } from "@/modules/finance/types";
import type { UiPaymentMethod } from "@/modules/finance/services/tuition-service";
import {
  FISCAL_STATUS, settlementService, type ApiCustomerOptions, type ApiSettlement, type CustomerKind,
} from "@/modules/finance/services/settlement-service";

interface SettlementSheetProps {
  isOpen: boolean;
  onClose: () => void;
  /** Propinas escolhidas na lista: têm de ser do mesmo aluno (uma liquidação, uma factura-recibo). */
  fees: StudentTuitionFee[];
}

const PAYMENT_METHODS: { id: UiPaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: "MULTICAIXA", label: "Multicaixa (TPA)", icon: "CreditCard", desc: "Pagamento com cartão no terminal da escola" },
  { id: "CASH", label: "Numerário", icon: "Banknote", desc: "Dinheiro entregue na tesouraria" },
  { id: "TRANSFER", label: "Transferência", icon: "Building2", desc: "Depósito ou transferência por IBAN" },
  { id: "EXPRESS", label: "MCX Express", icon: "Smartphone", desc: "Pagamento móvel Multicaixa Express" },
];

type Choice = { kind: CustomerKind; guardianId?: string };

/** Cobranças a liquidar: a de origem (se ainda tem saldo) e as multas por pagar, cada uma pelo valor total em dívida. */
export function invoiceIdsOf(fees: StudentTuitionFee[]): string[] {
  return fees.flatMap((f) => [...((f.baseBalance ?? f.totalAmount) > 0 ? [f.id] : []), ...(f.penalties ?? []).map((p) => p.id)]);
}

/**
 * Marcar como pago (uma ou mais cobranças do mesmo aluno). Regista o pagamento do valor total em dívida e pede a
 * factura-recibo ao MindGest. O pagamento fica sempre registado; se a escola não estiver ligada, ou faltar o imposto de
 * algum serviço, a factura-recibo fica em espera e segue sozinha.
 */
export function SettlementSheet({ isOpen, onClose, fees }: SettlementSheetProps) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const students = useMemo(() => [...new Set(fees.map((f) => f.studentId))], [fees]);
  const studentId = students.length === 1 ? students[0]! : null;
  const invoiceIds = useMemo(() => invoiceIdsOf(fees), [fees]);
  const total = fees.reduce((a, f) => a + f.totalAmount, 0);

  const [method, setMethod] = useState<UiPaymentMethod>("MULTICAIXA");
  const [reference, setReference] = useState("");
  const [picked, setPicked] = useState<Choice | null>(null);
  const [done, setDone] = useState<ApiSettlement | null>(null);
  // Mesma chave enquanto o pedido é o mesmo: um duplo clique (ou um novo envio após falha de rede) não regista duas vezes.
  const key = useRef<{ sig: string; id: string }>({ sig: "", id: "" });

  const options = useQuery({
    queryKey: ["settlement-customer-options", schoolId, studentId],
    queryFn: () => settlementService.customerOptions(studentId!),
    enabled: isOpen && Boolean(studentId),
    staleTime: 0,
  });

  // Cliente: o escolhido, ou a escolha por omissão da API (encarregado com NIF > aluno com NIF > consumidor final).
  const choice: Choice | null = picked ?? (options.data ? { kind: options.data.default.kind, ...(options.data.default.guardian_id ? { guardianId: options.data.default.guardian_id } : {}) } : null);

  const submit = useMutation({
    mutationFn: () => {
      const input = { invoiceIds, method, ...(reference.trim() ? { reference: reference.trim() } : {}), ...(choice ? { customer: choice } : {}) };
      // A mesma chave só enquanto o pedido é o mesmo: repetir um pedido igual não regista duas vezes; um pedido diferente leva chave nova.
      const sig = JSON.stringify(input);
      if (key.current.sig !== sig) {
        key.current = { sig, id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `liq-${Date.now()}-${Math.random().toString(36).slice(2)}` };
      }
      return settlementService.create(input, key.current.id);
    },
    onSuccess: (s) => {
      setDone(s);
      SucessMessage("Pagamento registado.");
      void queryClient.invalidateQueries({ queryKey: financeKeys.feesAll() });
      void queryClient.invalidateQueries({ queryKey: financeKeys.invoices(schoolId) });
      void queryClient.invalidateQueries({ queryKey: financeKeys.documents(schoolId) });
    },
    onError: (e) => ErrorMessage(getApiErrorMessage(e, "Não foi possível registar o pagamento.")),
  });

  if (!isOpen || fees.length === 0) return null;

  const mixed = students.length > 1;
  const selectedOk = choice?.kind === "consumidor_final" || customerHasNif(options.data, choice);
  const canSubmit = !mixed && invoiceIds.length > 0 && !submit.isPending && Boolean(options.data) && selectedOk;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-5 border-b shrink-0">
          <SheetTitle className="text-lg font-bold">Marcar como pago</SheetTitle>
          <SheetDescription className="text-xs">
            Regista o valor total em dívida e pede a factura-recibo ao MindGest. Não há pagamento parcial.
          </SheetDescription>
        </SheetHeader>

        {/* Nenhum painel tem scroll: o corpo é compacto (o resumo das cobranças é uma linha e as formas de pagamento cabem numa só). */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {done ? (
            <DoneCard settlement={done} />
          ) : (
            <>
              {mixed && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  Escolheu propinas de alunos diferentes. Cada pagamento (e cada factura-recibo) é de um só aluno: deixe só um aluno seleccionado.
                </p>
              )}

              <div className="space-y-1.5 rounded-xl border bg-muted/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{fees[0]!.studentName}</p>
                <p className="text-xs">
                  {fees.map((f) => `${f.monthLabel} / ${f.year}${(f.penalties?.length ?? 0) > 0 ? " + multa" : ""}`).join(" · ")}
                </p>
                <div className="flex justify-between border-t pt-1.5 text-sm font-bold">
                  <span>Total a pagar ({fees.length} {fees.length === 1 ? "cobrança" : "cobranças"})</span>
                  <span className="text-primary tabular-nums">{formatCurrency(total)}</span>
                </div>
              </div>

              <IntegrationNotice state={options.data?.integration} loading={options.isLoading} />

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">Forma de pagamento</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const on = method === m.id;
                    return (
                      <button key={m.id} type="button" title={m.desc} onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${on ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted/50"}`}>
                        <Icon name={m.icon as any} className={`h-4 w-4 ${on ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-sm font-semibold text-foreground">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settlement-ref" className="text-xs text-foreground">N.º de talão / transação (opcional)</Label>
                <Input id="settlement-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex: 94829103" className="h-10 text-xs" maxLength={50} />
              </div>

              <CustomerChooser
                options={options.data}
                loading={options.isLoading}
                error={options.isError ? getApiErrorMessage(options.error, "Não foi possível carregar os dados do cliente.") : null}
                choice={choice}
                onChoose={setPicked}
                onChanged={() => void options.refetch()}
              />
            </>
          )}
        </div>

        <SheetFooter>
          {done ? (
            <Button type="button" onClick={onClose}>Fechar</Button>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose} disabled={submit.isPending}>Cancelar</Button>
              <Button type="button" onClick={() => submit.mutate()} disabled={!canSubmit} className="gap-2">
                {submit.isPending ? (<><Icon name="Loader2" className="animate-spin" />A registar…</>) : (<><Icon name="Check" />Marcar como pago</>)}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function customerHasNif(o: ApiCustomerOptions | undefined, c: Choice | null): boolean {
  if (!o || !c) return false;
  if (c.kind === "aluno") return Boolean(o.student.nif);
  if (c.kind === "encarregado") return Boolean(o.guardians.find((g) => g.guardian_id === c.guardianId)?.nif);
  return true;
}

function IntegrationNotice({ state, loading }: { state: ApiCustomerOptions["integration"] | undefined; loading: boolean }) {
  if (loading || !state || state === "ready") {
    return state === "ready" ? (
      <p className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800">
        <Icon name="ShieldCheck" className="mt-0.5 size-4 shrink-0" /> A escola está ligada ao MindGest: a factura-recibo é pedida logo a seguir ao pagamento.
      </p>
    ) : null;
  }
  const text = state === "pausada"
    ? "As emissões pelo MindGest estão em pausa. O pagamento fica registado e a factura-recibo segue quando o titular reactivar as emissões (Definições › Integrações › MindGest)."
    : state === "sem_ligacao"
    ? "A escola não está ligada ao MindGest. O pagamento fica registado, mas a factura-recibo só é emitida depois de o titular ligar a escola (Definições › Integrações › MindGest)."
    : "O catálogo do MindGest está incompleto: há serviços sem imposto definido. O pagamento fica registado e a factura-recibo segue quando o imposto for definido no MindGest.";
  return (
    <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900">
      <Icon name="TriangleAlert" className="mt-0.5 size-4 shrink-0" /> {text}
    </p>
  );
}

function DoneCard({ settlement }: { settlement: ApiSettlement }) {
  const st = FISCAL_STATUS[settlement.fiscal_document?.status ?? "sem_submissao"];
  return (
    <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-sm">
      <p className="flex items-center gap-2 font-semibold"><Icon name="CircleCheck" className="size-4 text-emerald-600" /> Pagamento registado: {formatCurrency(Number(settlement.total))}</p>
      <p className="text-xs text-muted-foreground">Cliente da factura-recibo: <strong>{settlement.customer.name}</strong>{settlement.customer.nif ? ` · NIF ${settlement.customer.nif}` : " · consumidor final"}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Factura-recibo:</span>
        <Badge variant={st.variant} className="font-normal">{st.label}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{st.hint} Acompanhe em <strong>Propinas &amp; Finanças › Facturas</strong>.</p>
    </div>
  );
}

function CustomerChooser(p: {
  options: ApiCustomerOptions | undefined; loading: boolean; error: string | null;
  choice: Choice | null; onChoose: (c: Choice) => void; onChanged: () => void;
}) {
  if (p.loading) return <div className="h-24 animate-pulse rounded-xl bg-muted" />;
  if (p.error || !p.options) return <p className="text-xs text-destructive">{p.error ?? "Sem dados."}</p>;
  const o = p.options;
  const same = (c: Choice) => p.choice?.kind === c.kind && p.choice?.guardianId === c.guardianId;
  const rows: Array<{ choice: Choice; title: string; subtitle: string; nif: string | null; save: (nif: string) => Promise<void> }> = [
    ...o.guardians.map((g) => ({
      choice: { kind: "encarregado" as const, guardianId: g.guardian_id }, title: g.full_name, subtitle: g.is_primary_contact ? "Encarregado (contacto principal)" : "Encarregado", nif: g.nif,
      save: (nif: string) => settlementService.saveGuardianNif(g.guardian_id, nif),
    })),
    { choice: { kind: "aluno" as const }, title: o.student.full_name, subtitle: "Aluno", nif: o.student.nif, save: (nif: string) => settlementService.saveStudentNif(o.student.student_id, nif) },
  ];
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">Em nome de quem sai a factura-recibo</Label>
      <p className="text-[11px] text-muted-foreground">Por omissão, o encarregado com NIF; sem NIF, o aluno; sem NIF de ninguém, «consumidor final». O NIF é facultativo, serve só para a factura-recibo (é enviado ao MindGest, que a emite) e, se o guardar, fica na ficha cifrado.</p>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={`${r.choice.kind}-${r.choice.guardianId ?? ""}`} className={`rounded-lg border px-3 py-2 ${same(r.choice) ? "border-primary bg-primary/5" : "border-border"}`}>
            <button type="button" className="flex w-full items-center justify-between gap-2 text-left" onClick={() => p.onChoose(r.choice)}>
              <span className="min-w-0 truncate">
                <span className="text-sm font-semibold">{r.title}</span>
                <span className="text-[11px] text-muted-foreground"> · {r.subtitle}</span>
              </span>
              <span className="font-mono text-xs text-muted-foreground">{r.nif ? `NIF ${r.nif}` : "sem NIF"}</span>
            </button>
            {same(r.choice) && !r.nif && <NifEditor onSave={r.save} onSaved={p.onChanged} />}
          </div>
        ))}
        <button type="button" onClick={() => p.onChoose({ kind: "consumidor_final" })}
          className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${p.choice?.kind === "consumidor_final" ? "border-primary bg-primary/5" : "border-border"}`}>
          <span><span className="text-sm font-semibold">Consumidor final</span><span className="text-[11px] text-muted-foreground"> · factura sem NIF do cliente</span></span>
        </button>
      </div>
    </div>
  );
}

/** Registar o NIF de quem paga: «Verificar NIF» consulta o contribuinte (por proxy); só depois de «Guardar» fica na ficha. */
function NifEditor({ onSave, onSaved }: { onSave: (nif: string) => Promise<void>; onSaved: () => void }) {
  const [nif, setNif] = useState("");
  const [found, setFound] = useState<string | null>(null);
  const [busy, setBusy] = useState<"verify" | "save" | null>(null);
  const valid = isValidNif(nif);

  async function verify() {
    setBusy("verify");
    try {
      setFound((await settlementService.lookupNif(normalizeNif(nif))).name);
    } catch (e) {
      setFound(null);
      ErrorMessage(getApiErrorMessage(e, "Não foi possível verificar o NIF."));
    } finally { setBusy(null); }
  }
  async function save() {
    setBusy("save");
    try {
      await onSave(normalizeNif(nif));
      SucessMessage("NIF guardado.");
      onSaved();
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar o NIF."));
    } finally { setBusy(null); }
  }
  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label className="text-[11px]">NIF</Label>
          <Input value={nif} onChange={(e) => { setNif(e.target.value); setFound(null); }} placeholder="Ex: 5417012345" className="h-9 text-xs" />
        </div>
        <Button type="button" size="sm" variant="outline" disabled={!valid || busy !== null} onClick={() => void verify()}>Verificar NIF</Button>
        <Button type="button" size="sm" disabled={!valid || busy !== null} onClick={() => void save()}>Guardar</Button>
      </div>
      {nif.trim() !== "" && !valid && <p className="text-[11px] text-destructive">NIF inválido: 10 dígitos, ou 9 dígitos + 2 letras + 3 dígitos.</p>}
      {found && <p className="text-[11px] text-emerald-700">Contribuinte encontrado: <strong>{found}</strong></p>}
    </div>
  );
}
