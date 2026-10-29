"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import {
  Button,
  Checkbox,
  DynamicMetricCard,
  DynamicMetricCardSkeleton,
  EmptyState,
  FeatureGate,
  FormModal,
  FormSelect,
  Icon,
  Input,
  InputCurrency,
  Label,
  TitleList,
} from "@/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatCurrency } from "@/utils/format-currency";
import { CustomEmolumentsSection } from "./custom-emoluments-section";
import { EmailTemplateEditor, EMAIL_TEMPLATE_MODAL_ID } from "./email-template-editor";

const MODAL_ID = "tuition-policy";

/** Política financeira da escola (propina, prazos, multas progressivas, emolumentos e régua de email). */
export function TuitionPlansContent() {
  const { plans, plansLoading, savePolicy } = useTuition();
  const { openModal } = useModal();
  const policy = plans[0];

  // Valores Base
  const [monthly, setMonthly] = useState<number>(0);
  const [registration, setRegistration] = useState<number>(0);

  // Prazos da Propina
  const [dueStartDay, setDueStartDay] = useState<string>("1");
  const [dueDay, setDueDay] = useState<string>("20");
  const [graceDays, setGraceDays] = useState<string>("2");

  // Multas e Mora Progressiva
  const [penaltyType, setPenaltyType] = useState<"percentage" | "fixed">("percentage");
  const [penaltyValue, setPenaltyValue] = useState<number>(10);
  const [monthlyIncreaseType, setMonthlyIncreaseType] = useState<"percentage" | "fixed">("percentage");
  const [monthlyIncreaseValue, setMonthlyIncreaseValue] = useState<number>(5);

  // Automação da Régua de E-mail
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [preDueDays, setPreDueDays] = useState("5");
  const [graceWarning, setGraceWarning] = useState(true);
  const [penaltyNotification, setPenaltyNotification] = useState(true);
  const [monthlyFollowup, setMonthlyFollowup] = useState(true);

  const openEdit = () => {
    setMonthly(policy?.monthlyAmount ?? 0);
    setRegistration(policy?.registrationFee ?? 0);

    setDueStartDay(String(policy?.dueStartDay ?? 1));
    setDueDay(String(policy?.dueDay ?? 20));
    setGraceDays(String(policy?.penaltyGracePeriodDays ?? 2));

    setPenaltyType(policy?.latePenaltyType ?? "percentage");
    setPenaltyValue(policy?.latePenaltyValue ?? policy?.latePenaltyPercent ?? 10);
    setMonthlyIncreaseType(policy?.monthlyIncreaseType ?? "percentage");
    setMonthlyIncreaseValue(policy?.monthlyIncreaseValue ?? 5);

    setEmailEnabled(policy?.emailCollections?.enabled ?? true);
    setPreDueDays(String(policy?.emailCollections?.preDueDays ?? 5));
    setGraceWarning(policy?.emailCollections?.graceWarning ?? true);
    setPenaltyNotification(policy?.emailCollections?.penaltyNotification ?? true);
    setMonthlyFollowup(policy?.emailCollections?.monthlyFollowup ?? true);

    openModal(MODAL_ID);
  };

  const save = async () => {
    try {
      await savePolicy.mutateAsync({
        monthlyAmount: Number(monthly) || 0,
        registrationFee: Number(registration) || 0,
        dueStartDay: Math.min(28, Math.max(1, Number(dueStartDay) || 1)),
        dueDay: Math.min(28, Math.max(1, Number(dueDay) || 20)),
        graceDays: Math.min(30, Math.max(0, Number(graceDays) || 2)),
        latePenaltyType: penaltyType,
        latePenaltyValue: Number(penaltyValue) || 0,
        monthlyIncreaseType,
        monthlyIncreaseValue: Number(monthlyIncreaseValue) || 0,
        customEmoluments: policy?.customEmoluments,
        emailCollections: {
          enabled: emailEnabled,
          preDueDays: Math.min(15, Math.max(1, Number(preDueDays) || 5)),
          graceWarning,
          penaltyNotification,
          monthlyFollowup,
        },
      });
      SucessMessage("Política financeira e regras de mora atualizadas.");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Não foi possível guardar a política financeira."));
      throw e;
    }
  };

  const formatPenaltySummary = () => {
    if (!policy) return "—";
    const baseStr =
      policy.latePenaltyType === "fixed"
        ? formatCurrency(policy.latePenaltyValue)
        : `${policy.latePenaltyValue || policy.latePenaltyPercent}%`;
    const incStr =
      (policy.monthlyIncreaseValue ?? 0) > 0
        ? ` + ${policy.monthlyIncreaseType === "fixed" ? formatCurrency(policy.monthlyIncreaseValue) : `${policy.monthlyIncreaseValue}%`}/mês`
        : "";
    return `${baseStr}${incStr}`;
  };

  return (
    <div className="space-y-6">
      <TitleList
        title="Propinas, Emolumentos & Política Financeira"
        suTitle="Prazos de pagamento de propina, tolerância, multas progressivas e catálogo de taxas escolares."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => openModal(EMAIL_TEMPLATE_MODAL_ID)}
            className="gap-2 text-xs font-semibold"
          >
            <Icon name="MailCheck" className="size-4 text-primary" />
            Modelos de E-mail
          </Button>

          <FeatureGate permission="school:update" fallback="disabled" tooltipMessage="Apenas a direção geral pode alterar a política financeira.">
            <Button onClick={openEdit} disabled={plansLoading} className="gap-2 text-xs font-semibold">
              <Icon name="Pencil" className="size-4" />
              Configurar política financeira
            </Button>
          </FeatureGate>
        </div>
      </TitleList>

      {plansLoading ? (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4" aria-busy="true" aria-label="A carregar a política financeira">
          {Array.from({ length: 4 }, (_, i) => <DynamicMetricCardSkeleton key={i} />)}
        </div>
      ) : !policy ? (
        <EmptyState icon="Wallet" title="Sem política financeira" description="Defina o valor da propina e as regras de mora para gerar faturas." />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
          <DynamicMetricCard
            title={formatCurrency(policy.monthlyAmount)}
            subtitle="Propina mensal"
            description="Valor base de cada mensalidade"
            icon="Wallet"
          />
          <DynamicMetricCard
            title={`Dia ${policy.dueStartDay ?? 1} ao ${policy.dueDay ?? 20}`}
            subtitle="Prazo de pagamento"
            description={`Com ${policy.penaltyGracePeriodDays} dia(s) de tolerância (até dia ${(policy.dueDay ?? 20) + (policy.penaltyGracePeriodDays ?? 2)})`}
            icon="Calendar"
          />
          <DynamicMetricCard
            title={formatPenaltySummary()}
            subtitle="Multa & Mora progressiva"
            description="Aplicada após a tolerância com incremento mensal"
            icon="CircleAlert"
          />
          <DynamicMetricCard
            title={policy.emailCollections?.enabled !== false ? "Ativa" : "Desativada"}
            subtitle="Régua de e-mail"
            description={`Lembrete ${policy.emailCollections?.preDueDays ?? 5}d antes + tolerância e multa`}
            icon="Mail"
          />
        </div>
      )}

      {/* Secção de Emolumentos Próprios da Escola */}
      <CustomEmolumentsSection />

      {/* Modal de Configuração Completa da Política Financeira com InputCurrency */}
      <FormModal
        id={MODAL_ID}
        title="Política Financeira & Prazos Escolares"
        description="Defina os prazos mensais de pagamento, tolerâncias de carência, multas progressivas e automações por correio electrónico."
        submitLabel="Guardar política"
        isLoading={savePolicy.isPending}
        size="lg"
        onSubmit={save}
      >
        {/* Três separadores em vez de uma coluna longa: nenhum modal tem scroll. */}
        <Tabs defaultValue="valores" className="sm:col-span-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="valores">Valores e prazos</TabsTrigger>
            <TabsTrigger value="multas">Multas</TabsTrigger>
            <TabsTrigger value="email">Lembretes por e-mail</TabsTrigger>
          </TabsList>
          <TabsContent value="valores" className="space-y-5 pt-3">
          {/* Bloco 1: Valores Base */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <Icon name="Wallet" className="size-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Valores Base das Mensalidades</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InputCurrency
                label="Propina Mensal (Kz) *"
                currency="Kz"
                value={monthly}
                onValueChange={(val) => setMonthly(val)}
                placeholder="Ex.: 45.000 Kz"
              />
              <InputCurrency
                label="Taxa de Matrícula (Kz) *"
                currency="Kz"
                value={registration}
                onValueChange={(val) => setRegistration(val)}
                placeholder="Ex.: 15.000 Kz"
              />
            </div>
          </div>

          {/* Bloco 2: Prazos e Tolerância */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <Icon name="CalendarRange" className="size-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Prazos e Período de Tolerância</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                label="Dia Inicial de Pagamento"
                type="number"
                min={1}
                max={28}
                value={dueStartDay}
                onChange={(e) => setDueStartDay(e.target.value)}
                placeholder="1"
              />
              <Input
                label="Dia Limite (Vencimento) *"
                type="number"
                min={1}
                max={28}
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="20"
              />
              <Input
                label="Dias de 1ª Tolerância *"
                type="number"
                min={0}
                max={30}
                value={graceDays}
                onChange={(e) => setGraceDays(e.target.value)}
                placeholder="2"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Exemplo configurado: O encarregado pode pagar do dia {dueStartDay || "1"} ao dia {dueDay || "20"}. Tem mais {graceDays || "2"} dia(s) de tolerância (até dia {Number(dueDay || 20) + Number(graceDays || 2)}) sem incidência de multa.
            </p>
          </div>

          </TabsContent>
          <TabsContent value="multas" className="space-y-5 pt-3">
          {/* Bloco 3: Multas e Agravamento Progressivo por Mês */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <Icon name="TrendingUp" className="size-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Multa Inicial e Incremento Progressivo por Mês</h4>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2 rounded-xs border border-border/50 bg-muted/20 p-3">
                <p className="text-xs font-semibold text-foreground">1ª Multa (após a tolerância)</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <FormSelect
                    label="Tipo de Multa"
                    value={penaltyType}
                    onValueChange={(v) => setPenaltyType(v as "percentage" | "fixed")}
                    options={[
                      { value: "percentage", label: "Percentagem (%)" },
                      { value: "fixed", label: "Valor Fixo (Kz)" },
                    ]}
                  />
                  {penaltyType === "fixed" ? (
                    <InputCurrency
                      label="Valor da Multa (Kz)"
                      currency="Kz"
                      value={penaltyValue}
                      onValueChange={(val) => setPenaltyValue(val)}
                      placeholder="Ex.: 3.000 Kz"
                    />
                  ) : (
                    <Input
                      label="Percentual (%)"
                      type="number"
                      min={0}
                      max={100}
                      value={String(penaltyValue)}
                      onChange={(e) => setPenaltyValue(Number(e.target.value))}
                      placeholder="10"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2 rounded-xs border border-border/50 bg-muted/20 p-3">
                <p className="text-xs font-semibold text-foreground">Agravamento por Cada Mês Adicional</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <FormSelect
                    label="Tipo de Incremento"
                    value={monthlyIncreaseType}
                    onValueChange={(v) => setMonthlyIncreaseType(v as "percentage" | "fixed")}
                    options={[
                      { value: "percentage", label: "Percentagem (%)" },
                      { value: "fixed", label: "Valor Fixo (Kz)" },
                    ]}
                  />
                  {monthlyIncreaseType === "fixed" ? (
                    <InputCurrency
                      label="Acréscimo/Mês (Kz)"
                      currency="Kz"
                      value={monthlyIncreaseValue}
                      onValueChange={(val) => setMonthlyIncreaseValue(val)}
                      placeholder="Ex.: 1.500 Kz"
                    />
                  ) : (
                    <Input
                      label="Percentual/Mês (%)"
                      type="number"
                      min={0}
                      max={100}
                      value={String(monthlyIncreaseValue)}
                      onChange={(e) => setMonthlyIncreaseValue(Number(e.target.value))}
                      placeholder="5"
                    />
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Passada a tolerância, incide a 1ª multa ({penaltyType === "fixed" ? formatCurrency(penaltyValue) : `${penaltyValue}%`}). A cada mês suplementar em dívida, a multa agrava-se em {monthlyIncreaseType === "fixed" ? formatCurrency(monthlyIncreaseValue) : `${monthlyIncreaseValue}%`}.
            </p>
          </div>

          </TabsContent>
          <TabsContent value="email" className="space-y-5 pt-3">
          {/* Bloco 4: Automação da Régua de E-mail */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/40 pb-1.5">
              <Icon name="MailCheck" className="size-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Automação de Cobrança por Correio Electrónico</h4>
            </div>
            <div className="space-y-2.5 rounded-xs border border-border/50 bg-muted/20 p-3 text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="email-enabled"
                  checked={emailEnabled}
                  onCheckedChange={(c) => setEmailEnabled(Boolean(c))}
                />
                <Label htmlFor="email-enabled" className="text-xs font-medium cursor-pointer">
                  Ativar régua automática de correio electrónico para os encarregados
                </Label>
              </div>

              {emailEnabled && (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pre-due"
                      checked={Number(preDueDays) > 0}
                      onCheckedChange={(c) => setPreDueDays(c ? "5" : "0")}
                    />
                    <Label htmlFor="pre-due" className="text-xs font-normal text-muted-foreground flex items-center gap-2">
                      Enviar lembrete preventivo
                      <span className="w-16 inline-block">
                        <Input
                          type="number"
                          min={1}
                          max={15}
                          value={preDueDays}
                          onChange={(e) => setPreDueDays(e.target.value)}
                          className="h-7 px-2 text-xs text-center"
                        />
                      </span>
                      dias antes do vencimento (dia {dueDay})
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="grace-warning"
                      checked={graceWarning}
                      onCheckedChange={(c) => setGraceWarning(Boolean(c))}
                    />
                    <Label htmlFor="grace-warning" className="text-xs font-normal text-muted-foreground cursor-pointer">
                      Enviar aviso preventivo durante o período de tolerância (antes da aplicação de multa)
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="penalty-notif"
                      checked={penaltyNotification}
                      onCheckedChange={(c) => setPenaltyNotification(Boolean(c))}
                    />
                    <Label htmlFor="penalty-notif" className="text-xs font-normal text-muted-foreground cursor-pointer">
                      Enviar aviso formal quando a multa é aplicada após o fim da tolerância
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="monthly-follow"
                      checked={monthlyFollowup}
                      onCheckedChange={(c) => setMonthlyFollowup(Boolean(c))}
                    />
                    <Label htmlFor="monthly-follow" className="text-xs font-normal text-muted-foreground cursor-pointer">
                      Enviar aviso mensal com o cálculo da multa agravada para dívidas em atraso
                    </Label>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(EMAIL_TEMPLATE_MODAL_ID)}
                      className="w-full gap-2 text-xs font-medium"
                    >
                      <Icon name="MailCheck" className="size-3.5 text-primary" />
                      Personalizar Modelos de E-mail (Lembrete, Tolerância, Multa, Recibo)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          </TabsContent>
        </Tabs>
      </FormModal>

      {/* Sheet do Estúdio de Templates de E-mail com Live Preview */}
      <EmailTemplateEditor />
    </div>
  );
}
