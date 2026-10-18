"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/common/icon";
import { StudentTuitionFee } from "@/modules/finance/types";
import { useTuitionBilling } from "@/modules/finance/hooks/use-tuition-billing";
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
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (fee) {
      setPaymentReference(`LIQ-${fee.studentNumber}-${fee.month}`);
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
      notes,
    });

    onClose();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-lg font-bold">Liquidação de Mensalidade Escolar</SheetTitle>
          <SheetDescription className="text-xs">
            {`Regista o pagamento do saldo total de ${fee.studentName} (propina e multas por pagar) e abre o comprovativo interno, sem valor fiscal. O documento fiscal é emitido pela certificação da factura.`}
          </SheetDescription>
        </SheetHeader>

      <form id="tuition-payment-form" onSubmit={handleConfirmPayment} className="flex-1 overflow-y-auto p-6 space-y-5">
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

        </div>

      </form>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button type="submit" form="tuition-payment-form" disabled={isProcessing} className="gap-2">
            {isProcessing ? (
              <>
                <Icon name="Loader2" className="animate-spin" />
                A Processar...
              </>
            ) : (
              <>
                <Icon name="Check" />
                Registar pagamento
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
