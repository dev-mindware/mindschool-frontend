"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  FormSelect,
  Icon,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { EmailTemplateItem } from "@/modules/finance/types";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatCurrency } from "@/utils/format-currency";
import { getApiErrorMessage } from "@/utils/api-error";
import { SucessMessage, ErrorMessage } from "@/utils/messages";

export const EMAIL_TEMPLATE_MODAL_ID = "email-template-studio";

type TemplateKey = "pre_due" | "grace" | "penalty" | "receipt";

interface TemplateDefinition {
  key: TemplateKey;
  label: string;
  badge: string;
  description: string;
  icon: string;
  defaultSubject: string;
  defaultBody: string;
}

const TEMPLATE_DEFS: TemplateDefinition[] = [
  {
    key: "pre_due",
    label: "Lembrete Preventivo",
    badge: "5 dias antes",
    description: "Notificação cordial enviada antes da data de vencimento da mensalidade.",
    icon: "Clock",
    defaultSubject: "Lembrete de Pagamento de Propina - {{mes_ano}} | {{nome_escola}}",
    defaultBody: `Prezado(a) Encarregado(a) {{nome_encarregado}},

Vimos por este meio recordar que a propina referente ao mês de {{mes_ano}} do(a) estudante {{nome_estudante}} (Processo nº {{numero_processo}}, Turma {{turma}}) tem o seu vencimento fixado para o dia {{data_vencimento}}.

Montante a liquidar: {{montante_propina}} Kz

Para a regularização dos valores, poderá utilizar os canais habituais da instituição ou transferência para a conta oficial:
IBAN da Escola: {{iban_escola}}

Caso já tenha procedido à liquidação, por favor desconsidere este aviso ou anexe o comprovativo no Portal do Encarregado.

Com os melhores cumprimentos,
Direção Financeira de {{nome_escola}}`,
  },
  {
    key: "grace",
    label: "Aviso de Tolerância",
    badge: "Durante carência",
    description: "Aviso preventivo emitido após o vencimento sem aplicação imediata de multa.",
    icon: "ShieldAlert",
    defaultSubject: "Aviso de Tolerância de Pagamento - {{mes_ano}} | {{nome_escola}}",
    defaultBody: `Prezado(a) Encarregado(a) {{nome_encarregado}},

Informamos que a mensalidade de {{mes_ano}} do(a) estudante {{nome_estudante}} atingiu a data limite de vencimento a {{data_vencimento}}.

Em conformidade com o regulamento interno da instituição, encontra-se em vigor um período de tolerância de {{dias_tolerancia}} dias úteis, findo o qual será aplicada a respectiva multa por atraso.

Montante pendente: {{montante_propina}} Kz
IBAN para regularização: {{iban_escola}}

Agradecemos a atenção e solicitamos a regularização com brevidade para evitar encargos adicionais.

Atenciosamente,
Secretaria & Tesouraria de {{nome_escola}}`,
  },
  {
    key: "penalty",
    label: "Multa & Mora",
    badge: "Após tolerância",
    description: "Notificação formal emitida quando a tolerância expira e a multa é aplicada.",
    icon: "AlertTriangle",
    defaultSubject: "Aviso Formal de Mora e Aplicação de Multa - {{mes_ano}} | {{nome_escola}}",
    defaultBody: `Exmo(a). Sr(a). {{nome_encarregado}},

Constatamos que o período de tolerância concedido para a mensalidade de {{mes_ano}} do(a) estudante {{nome_estudante}} (Processo nº {{numero_processo}}) terminou sem registo de liquidação.

Deste modo, e em cumprimento das normas financeiras em vigor, foi aplicada a multa regulamentar de {{valor_multa}} Kz, perfazendo um total atualizado a regularizar de {{total_regularizar}} Kz.

Chamamos a atenção para o facto de a não liquidação tempestiva originar o agravamento mensal da taxa de mora.

Solicitamos a comparência nos serviços de tesouraria ou o envio do comprovativo de transferência bancária para o IBAN {{iban_escola}}.

A Direção de {{nome_escola}}`,
  },
  {
    key: "receipt",
    label: "Confirmação & Recibo",
    badge: "Pós-pagamento",
    description: "Mensagem automática de agradecimento e confirmação de recebimento.",
    icon: "CheckCircle2",
    defaultSubject: "Confirmação de Pagamento de Propina - {{mes_ano}} | {{nome_escola}}",
    defaultBody: `Prezado(a) Encarregado(a) {{nome_encarregado}},

Acusamos a boa recepção do pagamento referente à mensalidade de {{mes_ano}} do(a) educando(a) {{nome_estudante}}, no valor total de {{montante_propina}} Kz.

O respectivo recibo foi devidamente emitido no sistema e pode ser consultado e descarregado a qualquer momento através do Portal do Aluno/Encarregado.

Agradecemos o cumprimento atempado das obrigações escolares.

Com apreço,
Serviços de Tesouraria de {{nome_escola}}`,
  },
];

const AVAILABLE_VARIABLES = [
  { tag: "{{nome_escola}}", label: "Escola", sample: "Colégio Futuro do Saber" },
  { tag: "{{nome_encarregado}}", label: "Encarregado", sample: "Sr. António Manuel" },
  { tag: "{{nome_estudante}}", label: "Estudante", sample: "Esperança Manuel" },
  { tag: "{{numero_processo}}", label: "Nº Processo", sample: "2026/0412" },
  { tag: "{{turma}}", label: "Turma", sample: "10ª A (Manhã)" },
  { tag: "{{mes_ano}}", label: "Mês/Ano", sample: "Outubro de 2026" },
  { tag: "{{montante_propina}}", label: "Propina (Kz)", sample: "45.000,00" },
  { tag: "{{data_vencimento}}", label: "Vencimento", sample: "20 de Outubro de 2026" },
  { tag: "{{dias_tolerancia}}", label: "Tolerância (dias)", sample: "2" },
  { tag: "{{valor_multa}}", label: "Multa (Kz)", sample: "4.500,00" },
  { tag: "{{total_regularizar}}", label: "Total Geral (Kz)", sample: "49.500,00" },
  { tag: "{{iban_escola}}", label: "IBAN Escola", sample: "AO06 0040 0000 1234 5678 9012 3" },
];

export function EmailTemplateEditor() {
  const { plans, savePolicy } = useTuition();
  const { open, closeModal } = useModal();
  const policy = plans[0];

  const isSheetOpen = Boolean(open[EMAIL_TEMPLATE_MODAL_ID]);

  const [activeKey, setActiveKey] = useState<TemplateKey>("pre_due");
  const [sendHour, setSendHour] = useState<string>("08:00");
  const [templateDrafts, setTemplateDrafts] = useState<Record<TemplateKey, EmailTemplateItem>>(() => {
    const existing = policy?.emailCollections?.templates ?? {};
    const init: Record<TemplateKey, EmailTemplateItem> = {
      pre_due: {
        subject: existing.pre_due?.subject || TEMPLATE_DEFS[0].defaultSubject,
        body: existing.pre_due?.body || TEMPLATE_DEFS[0].defaultBody,
      },
      grace: {
        subject: existing.grace?.subject || TEMPLATE_DEFS[1].defaultSubject,
        body: existing.grace?.body || TEMPLATE_DEFS[1].defaultBody,
      },
      penalty: {
        subject: existing.penalty?.subject || TEMPLATE_DEFS[2].defaultSubject,
        body: existing.penalty?.body || TEMPLATE_DEFS[2].defaultBody,
      },
      receipt: {
        subject: existing.receipt?.subject || TEMPLATE_DEFS[3].defaultSubject,
        body: existing.receipt?.body || TEMPLATE_DEFS[3].defaultBody,
      },
    };
    return init;
  });

  const currentDef = TEMPLATE_DEFS.find((d) => d.key === activeKey) || TEMPLATE_DEFS[0];
  const currentDraft = templateDrafts[activeKey];

  const updateCurrentDraft = (field: "subject" | "body", value: string) => {
    setTemplateDrafts((prev) => ({
      ...prev,
      [activeKey]: {
        ...prev[activeKey],
        [field]: value,
      },
    }));
  };

  const insertVariable = (tag: string) => {
    const newBody = currentDraft.body ? `${currentDraft.body} ${tag}` : tag;
    updateCurrentDraft("body", newBody);
  };

  const resetToDefault = () => {
    updateCurrentDraft("subject", currentDef.defaultSubject);
    updateCurrentDraft("body", currentDef.defaultBody);
    SucessMessage(`Modelo "${currentDef.label}" restaurado para o padrão do sistema.`);
  };

  // Pré-visualização com substituição de tags dinâmicas
  const previewData = useMemo(() => {
    const map: Record<string, string> = {
      "{{nome_escola}}": "Colégio Futuro do Saber",
      "{{nome_encarregado}}": "Sr. António Manuel",
      "{{nome_estudante}}": "Esperança Manuel",
      "{{numero_processo}}": "2026/0412",
      "{{turma}}": "10ª A (Manhã)",
      "{{mes_ano}}": "Outubro de 2026",
      "{{montante_propina}}": formatCurrency(policy?.monthlyAmount || 45000),
      "{{data_vencimento}}": `20 de Outubro de 2026`,
      "{{dias_tolerancia}}": String(policy?.penaltyGracePeriodDays || 2),
      "{{valor_multa}}": formatCurrency(
        policy?.latePenaltyType === "fixed"
          ? policy.latePenaltyValue || 4500
          : ((policy?.monthlyAmount || 45000) * (policy?.latePenaltyPercent || 10)) / 100
      ),
      "{{total_regularizar}}": formatCurrency(
        (policy?.monthlyAmount || 45000) +
          (policy?.latePenaltyType === "fixed"
            ? policy.latePenaltyValue || 4500
            : ((policy?.monthlyAmount || 45000) * (policy?.latePenaltyPercent || 10)) / 100)
      ),
      "{{iban_escola}}": "AO06 0040 0000 1234 5678 9012 3",
    };

    let subject = currentDraft.subject;
    let body = currentDraft.body;

    for (const [tag, val] of Object.entries(map)) {
      subject = subject.replaceAll(tag, val);
      body = body.replaceAll(tag, val);
    }

    return { subject, body };
  }, [currentDraft, policy]);

  const handleSaveAll = async () => {
    try {
      if (!policy) return;
      await savePolicy.mutateAsync({
        monthlyAmount: policy.monthlyAmount,
        registrationFee: policy.registrationFee,
        dueStartDay: policy.dueStartDay,
        dueDay: policy.dueDay,
        graceDays: policy.penaltyGracePeriodDays,
        latePenaltyType: policy.latePenaltyType,
        latePenaltyValue: policy.latePenaltyValue,
        monthlyIncreaseType: policy.monthlyIncreaseType,
        monthlyIncreaseValue: policy.monthlyIncreaseValue,
        customEmoluments: policy.customEmoluments,
        emailCollections: {
          enabled: policy.emailCollections?.enabled ?? true,
          preDueDays: policy.emailCollections?.preDueDays ?? 5,
          graceWarning: policy.emailCollections?.graceWarning ?? true,
          penaltyNotification: policy.emailCollections?.penaltyNotification ?? true,
          monthlyFollowup: policy.emailCollections?.monthlyFollowup ?? true,
          sendHour,
          templates: templateDrafts,
        },
      });
      SucessMessage("Modelos de correio electrónico e horários atualizados com sucesso!");
      closeModal(EMAIL_TEMPLATE_MODAL_ID);
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Erro ao guardar modelos de e-mail."));
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={(v) => !v && closeModal(EMAIL_TEMPLATE_MODAL_ID)}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto p-6 sm:max-w-2xl">
        <SheetHeader className="p-0">
          <SheetTitle>Estúdio de Modelos & Comunicação por E-mail</SheetTitle>
          <SheetDescription>
            Personalize o texto, tags dinâmicas e pré-visualize em tempo real os e-mails formais disparados para os encarregados.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Topo: Tabs dos 4 Templates e Horário de Envio */}
          <div className="space-y-3 border-b pb-4">
            <Tabs value={activeKey} onValueChange={(v) => setActiveKey(v as TemplateKey)}>
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1">
                {TEMPLATE_DEFS.map((def) => (
                  <TabsTrigger key={def.key} value={def.key} className="gap-1.5 text-xs">
                    <Icon name={def.icon as any} className="size-3.5" />
                    <span>{def.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="max-w-xs">
              <FormSelect
                label="Horário de disparo"
                value={sendHour}
                onValueChange={setSendHour}
                options={[
                  { value: "07:00", label: "07:00 (Manhã cedo)" },
                  { value: "08:00", label: "08:00 (Início do expediente)" },
                  { value: "09:00", label: "09:00" },
                  { value: "12:00", label: "12:00 (Almoço)" },
                  { value: "14:00", label: "14:00 (Início da tarde)" },
                  { value: "18:00", label: "18:00 (Fim da tarde)" },
                ]}
              />
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Icon name="FileEdit" className="size-4 text-primary" />
                  Editor do Modelo: {currentDef.label}
                </h4>
                <p className="text-xs text-muted-foreground">{currentDef.description}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetToDefault} className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Icon name="RotateCcw" className="size-3.5" />
                Padrão
              </Button>
            </div>

            {/* Campo Assunto */}
            <div className="space-y-1.5">
              <Label htmlFor="template-subject" className="text-xs font-medium text-foreground">
                Assunto da Mensagem (com shortcodes)
              </Label>
              <Input
                id="template-subject"
                value={currentDraft.subject}
                onChange={(e) => updateCurrentDraft("subject", e.target.value)}
                placeholder="Ex.: Lembrete de Pagamento de Propina..."
                className="text-xs"
              />
            </div>

            {/* Chips de Inserção de Variáveis */}
            <div className="space-y-1.5 rounded-xs border border-border/50 bg-muted/20 p-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Tags Dinâmicas (Clique para inserir no texto)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_VARIABLES.map((v) => (
                  <Button
                    key={v.tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(v.tag)}
                    className="h-auto px-2 py-1 text-[11px] gap-1"
                    title={`Exemplo: ${v.sample}`}
                  >
                    <code>{v.tag}</code>
                    <span className="text-muted-foreground text-[10px]">({v.label})</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Corpo do E-mail */}
            <div className="space-y-1.5">
              <Label htmlFor="template-body" className="text-xs font-medium text-foreground">
                Corpo da Mensagem
              </Label>
              <Textarea
                id="template-body"
                rows={10}
                value={currentDraft.body}
                onChange={(e) => updateCurrentDraft("body", e.target.value)}
                className="font-mono text-xs leading-relaxed"
                placeholder="Escreva aqui o texto do modelo..."
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Icon name="Eye" className="size-4 text-emerald-600 dark:text-emerald-400" />
                Pré-visualização em Tempo Real
              </h4>
              <Badge variant="success" className="text-[10px]">
                HTML Formal Escola
              </Badge>
            </div>

            {/* Caixa que simula cliente de e-mail */}
            <div className="rounded-xs border border-border/70 bg-card p-4 shadow-sm space-y-3 text-xs">
              <div className="border-b pb-2.5 space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <span className="w-16 font-medium text-foreground">De:</span>
                  <span className="truncate">tesouraria@colegiofuturo.ao</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="w-16 font-medium text-foreground">Para:</span>
                  <span className="truncate">antonio.manuel@email.com (Encarregado)</span>
                </div>
                <div className="flex items-start text-foreground pt-1">
                  <span className="w-16 shrink-0 font-semibold">Assunto:</span>
                  <span className="font-semibold text-primary">{previewData.subject}</span>
                </div>
              </div>

              {/* Corpo Renderizado com Estilo de E-mail Escolar */}
              <div className="rounded-xs bg-background p-3.5 border border-border/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                  <div className="size-7 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    FS
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-[11px]">Colégio Futuro do Saber</p>
                    <p className="text-[10px] text-muted-foreground">Sistema de Gestão Escolar MindSchool</p>
                  </div>
                </div>

                <div className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/90 font-sans">
                  {previewData.body}
                </div>

                <div className="rounded bg-muted/30 p-2.5 border border-border/30 text-[10px] text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Informações de Apoio:</p>
                  <p>Secretaria Virtual disponível 24h/dia no Portal do Aluno.</p>
                  <p>Telefone: (+244) 923 000 000 | Luanda, Angola</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto flex-row justify-end gap-2 p-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => closeModal(EMAIL_TEMPLATE_MODAL_ID)}
            disabled={savePolicy.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSaveAll()}
            disabled={savePolicy.isPending}
            className="gap-2 text-xs font-semibold"
          >
            <Icon name="Save" className="size-4" />
            {savePolicy.isPending ? "A guardar..." : "Guardar todos os modelos"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
