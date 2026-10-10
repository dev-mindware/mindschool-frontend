"use client";

import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Button, DynamicMetricCard, EmptyState, FeatureGate, FormModal, Icon, Input, TitleList } from "@/components";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import { DocumentFeesSection } from "./document-fees-section";

/** Política financeira da escola (propina, matrícula e regras de mora). A API guarda uma única política por escola. */
export function TuitionPlansContent() {
  const { plans, savePolicy } = useTuition();
  const { openModal } = useModal();
  const policy = plans[0];

  const [monthly, setMonthly] = useState("");
  const [registration, setRegistration] = useState("");
  const [penalty, setPenalty] = useState("");
  const [grace, setGrace] = useState("");

  const openEdit = () => {
    setMonthly(String(policy?.monthlyAmount ?? 0));
    setRegistration(String(policy?.registrationFee ?? 0));
    setPenalty(String(policy?.latePenaltyPercent ?? 0));
    setGrace(String(policy?.penaltyGracePeriodDays ?? 5));
    openModal("tuition-policy");
  };

  const save = () =>
    savePolicy
      .mutateAsync({ monthlyAmount: Number(monthly) || 0, registrationFee: Number(registration) || 0, latePenaltyPercent: Number(penalty) || 0, penaltyGracePeriodDays: Number(grace) || 0 })
      .then(() => { SucessMessage("Política financeira actualizada."); })
      .catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar.")); throw e; });

  return (
    <div className="space-y-6">
      <TitleList title="Propinas & Taxas Escolares" suTitle="Valor da propina, taxa de matrícula e regras de mora aplicadas na geração das facturas.">
        <FeatureGate permission="school:update" fallback="disabled" tooltipMessage="Apenas a direcção geral pode alterar a política financeira.">
          <Button onClick={openEdit} className="gap-2 text-xs font-semibold"><Icon name="Pencil" className="size-4" />Editar política</Button>
        </FeatureGate>
      </TitleList>

      {!policy ? (
        <EmptyState icon="Wallet" title="Sem política financeira" description="Defina o valor da propina e as regras de mora para gerar facturas." />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
          <DynamicMetricCard title={formatCurrency(policy.monthlyAmount)} subtitle="Propina mensal" description="Valor base de cada mensalidade" icon="Wallet" />
          <DynamicMetricCard title={formatCurrency(policy.registrationFee)} subtitle="Taxa de matrícula" description="Cobrada na inscrição" icon="FileCheck" />
          <DynamicMetricCard title={`${policy.latePenaltyPercent}%`} subtitle="Multa por atraso" description="Aplicada após o período de tolerância" icon="CircleAlert" />
          <DynamicMetricCard title={`${policy.penaltyGracePeriodDays} dias`} subtitle="Tolerância de vencimento" description="Prazo sem multa de mora" icon="Calendar" />
        </div>
      )}

      <DocumentFeesSection />

      <FormModal id="tuition-policy" title="Política financeira" description="Estes valores aplicam-se às facturas geradas a partir de agora." submitLabel="Guardar" isLoading={savePolicy.isPending} onSubmit={save}>
        <Input label="Propina mensal (Kz)" type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
        <Input label="Taxa de matrícula (Kz)" type="number" value={registration} onChange={(e) => setRegistration(e.target.value)} />
        <Input label="Multa por atraso (%)" type="number" value={penalty} onChange={(e) => setPenalty(e.target.value)} />
        <Input label="Tolerância (dias)" type="number" value={grace} onChange={(e) => setGrace(e.target.value)} />
      </FormModal>
    </div>
  );
}
