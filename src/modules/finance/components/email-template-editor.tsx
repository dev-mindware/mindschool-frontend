"use client";

import { useMemo, useState } from "react";
import { Badge, Button, GlobalModal, Icon, Input } from "@/components";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { EmailTemplateItem } from "@/modules/finance/types";
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
Direcção Financeira de {{nome_escola}}`,
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

Deste modo, e em cumprimento das normas financeiras em vigor, foi aplicada a multa regulamentar de {{valor_multa}} Kz, perfazendo um total actualizado a regularizar de {{total_regularizar}} Kz.

Chamamos a atenção para o facto de a não liquidação tempestiva originar o agravamento mensal da taxa de mora.

Solicitamos a comparência nos serviços de tesouraria ou o envio do comprovativo de transferência bancária para o IBAN {{iban_escola}}.

A Direcção de {{nome_escola}}`,
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
  const policy = plans[0];

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
      SucessMessage("Modelos de correio electrónico e horários actualizados com sucesso!");
    } catch (e) {
      ErrorMessage(getApiErrorMessage(e, "Erro ao guardar modelos de e-mail."));
    }
  };

  return (
    <GlobalModal
      id={EMAIL_TEMPLATE_MODAL_ID}
      title="Estúdio de Modelos & Comunicação por E-mail"
      description="Personalize o texto, tags dinâmicas e pré-visualize em tempo real os e-mails formais disparados para os encarregados."
      className="!max-w-6xl w-full"
    >
      <div className="space-y-6">
        {/* Topo: Tabs dos 4 Templates e Horário de Envio */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_DEFS.map((def) => {
              const active = def.key === activeKey;
              return (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => setActiveKey(def.key)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon name={def.icon as any} className="size-3.5" />
                  <span>{def.label}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-background text-muted-foreground"
                    }`}
                  >
                    {def.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Icon name="AlarmClock" className="size-3.5 text-primary" />
              Horário de disparo:
            </span>
            <select
              value={sendHour}
              onChange={(e) => setSendHour(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="07:00">07:00 (Manhã cedo)</option>
              <option value="08:00">08:00 (Início do expediente)</option>
              <option value="09:00">09:00</option>
              <option value="12:00">12:00 (Almoço)</option>
              <option value="14:00">14:00 (Início da tarde)</option>
              <option value="18:00">18:00 (Fim da tarde)</option>
            </select>
          </div>
        </div>

        {/* Workspace: Split-screen Editor e Live Preview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Lado Esquerdo: Editor (7 colunas) */}
          <div className="space-y-4 lg:col-span-7">
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
              <label className="text-xs font-medium text-foreground">Assunto da Mensagem (com shortcodes)</label>
              <Input
                value={currentDraft.subject}
                onChange={(e) => updateCurrentDraft("subject", e.target.value)}
                placeholder="Ex.: Lembrete de Pagamento de Propina..."
                className="text-xs"
              />
            </div>

            {/* Chips de Inserção de Variáveis */}
            <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/20 p-3">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Tags Dinâmicas (Clique para inserir no texto)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_VARIABLES.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariable(v.tag)}
                    className="inline-flex items-center gap-1 rounded bg-background px-2 py-1 text-[11px] text-foreground border border-border/80 hover:border-primary hover:text-primary transition-colors cursor-pointer shadow-2xs"
                    title={`Exemplo: ${v.sample}`}
                  >
                    <code>{v.tag}</code>
                    <span className="text-muted-foreground text-[10px]">({v.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Corpo do E-mail */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Corpo da Mensagem</label>
              <textarea
                rows={11}
                value={currentDraft.body}
                onChange={(e) => updateCurrentDraft("body", e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono resize-y"
                placeholder="Escreva aqui o texto do modelo..."
              />
            </div>
          </div>

          {/* Lado Direito: Live Preview (5 colunas) */}
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Icon name="Eye" className="size-4 text-emerald-600 dark:text-emerald-400" />
                Pré-visualização em Tempo Real
              </h4>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-600/30">
                HTML Formal Escola
              </Badge>
            </div>

            {/* Caixa que simula cliente de e-mail */}
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm space-y-3 text-xs">
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
              <div className="rounded-lg bg-background p-3.5 border border-border/40 space-y-3">
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

        {/* Rodapé de Acções */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            onClick={handleSaveAll}
            disabled={savePolicy.isPending}
            className="gap-2 text-xs font-semibold"
          >
            <Icon name="Save" className="size-4" />
            {savePolicy.isPending ? "A guardar..." : "Guardar todos os modelos"}
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
