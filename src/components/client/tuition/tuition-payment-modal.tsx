"use client";

import React, { useState, useEffect } from "react";
import { GlobalModal } from "@/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/common/icon";
import { StudentTuitionFee } from "@/types/tuition";
import { useTuitionBilling } from "@/hooks/school/use-tuition-billing";
import { formatCurrency } from "@/utils/format-currency";

interface TuitionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: StudentTuitionFee | null;
}

type PaymentMethodType = "MULTICAIXA" | "CASH" | "TRANSFER" | "EXPRESS";

const PAYMENT_METHODS: { id: PaymentMethodType; label: string; icon: string; desc: string }[] = [
  { id: "MULTICAIXA", label: "Multicaixa (TPA)", icon: "CreditCard", desc: "Pagamento com cartão no terminal da escola" },
  { id: "CASH", label: "Numerário", icon: "Banknote", desc: "Dinheiro entregue na tesouraria" },
  { id: "TRANSFER", label: "Transferência", icon: "Building2", desc: "Depósito ou transferência por IBAN" },
  { id: "EXPRESS", label: "MCX Express", icon: "Smartphone", desc: "Pagamento móvel Multicaixa Express" },
];

export function TuitionPaymentModal({ isOpen, onClose, fee }: TuitionPaymentModalProps) {
  const { processPayment, isProcessing } = useTuitionBilling();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("MULTICAIXA");
  const [paymentReference, setPaymentReference] = useState("");
  const [guardianNif, setGuardianNif] = useState("");
  const [emitFiscalDocument, setEmitFiscalDocument] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (fee) {
      setPaymentReference(`LIQ-${fee.studentNumber}-${fee.month}`);
      setGuardianNif("");
      setNotes("");
    }
  }, [fee]);

  if (!isOpen || !fee) return null;

  async function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!fee) return;

    await processPayment({
      fee,
      paymentMethod,
      paymentReference,
      guardianNif,
      emitFiscalDocument,
      notes,
    });

    onClose();
  }

  return (
    <GlobalModal
      id="tuition-payment"
      isOpen={isOpen}
      onClose={onClose}
      canClose
      title="Liquidação de Mensalidade Escolar"
      description={`Registo de pagamento e emissão de Factura-Recibo para ${fee.studentName}.`}
      className="max-w-xl"
    >
      <form onSubmit={handleConfirmPayment} className="space-y-5">
        {/* Resumo do Aluno e Mensalidade */}
        <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
          <div className="flex items-start justify-between border-b pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estudante</p>
              <h4 className="font-semibold text-foreground text-base">{fee.studentName}</h4>
              <p className="text-xs text-muted-foreground">N.º {fee.studentNumber} • Turma: {fee.classSection}</p>
            </div>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 font-semibold text-xs">
              {fee.monthLabel} / {fee.year}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div>
              <span className="text-muted-foreground">Valor Base:</span>
              <p className="font-medium text-foreground">{formatCurrency(fee.baseAmount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Multa / Mora:</span>
              <p className="font-medium text-destructive">+{formatCurrency(fee.penaltyAmount)}</p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground font-semibold">Total a Liquidar:</span>
              <p className="text-base font-bold text-primary">{formatCurrency(fee.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Seleção do Método de Pagamento */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Forma de Liquidação
          </Label>
          <div className="grid grid-cols-2 gap-2.5">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      name={method.icon as any}
                      className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm font-semibold text-foreground">{method.label}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">{method.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campos Fiscais e Referência */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="paymentRef" className="text-xs text-foreground">
              N.º de Talão / Transação
            </Label>
            <Input
              id="paymentRef"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Ex: 94829103"
              className="h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nif" className="text-xs text-foreground">
              NIF do Encarregado (opcional)
            </Label>
            <Input
              id="nif"
              value={guardianNif}
              onChange={(e) => setGuardianNif(e.target.value)}
              placeholder="999999999 (Consumidor Final)"
              className="h-10 text-xs"
            />
          </div>
        </div>

        {/* Switch Factura-Recibo AGT */}
        <div className="rounded-xl border bg-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
              <Icon name="ShieldCheck" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Factura-Recibo Certificada AGT</p>
              <p className="text-[11px] text-muted-foreground">
                Geração síncrona com Hash Fiscal e Isenção de IVA (Art. 12.º do CIVA)
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={emitFiscalDocument}
            onChange={(e) => setEmitFiscalDocument(e.target.checked)}
            className="w-4 h-4 rounded cursor-pointer accent-primary"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="h-10 px-4 text-xs font-medium"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isProcessing}
            className="h-10 px-5 text-xs font-semibold tracking-tight gap-2"
          >
            {isProcessing ? (
              <>
                <Icon name="Loader2" className="w-3.5 h-3.5 animate-spin" />
                A Processar...
              </>
            ) : (
              <>
                <Icon name="Check" className="w-3.5 h-3.5" />
                Liquidar & Emitir Factura-Recibo
              </>
            )}
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
