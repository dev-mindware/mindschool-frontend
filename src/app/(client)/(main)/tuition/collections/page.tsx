import { PageWrapper, SchoolModulePlaceholder } from "@/components";

export default function TuitionCollectionsPage() {
  return (
    <PageWrapper
      routePath="/tuition"
      routeLabel="Propinas & Finanças"
      subRoute="Cobrança WhatsApp"
    >
      <SchoolModulePlaceholder
        title="Cobrança via WhatsApp"
        subtitle="Régua inteligente de lembretes automáticos com fallback para SMS."
        icon="MessageSquare"
        description="Reduza a inadimplência com envio automatizado de lembretes de propina por WhatsApp antes e após o vencimento. Paragem automática assim que o pagamento é registado e relatórios de taxa de entrega."
        badge="Diferencial 14.5"
        primaryActionLabel="Disparar Lembretes"
        primaryActionIcon="Send"
        secondaryActionLabel="Configurar Régua"
        secondaryActionIcon="SlidersHorizontal"
        stats={[
          { label: "Mensagens Entregues", value: "890", subtext: "98.2% taxa de entrega", icon: "CheckCheck" },
          { label: "Recuperação Pós-Aviso", value: "74%", subtext: "Pagam em 48h", icon: "TrendingUp" },
          { label: "Lembretes Agendados", value: "68", subtext: "Próximos 3 dias", icon: "Clock" },
          { label: "Economia em Chamadas", value: "100%", subtext: "Totalmente automatizado", icon: "Zap" },
        ]}
      />
    </PageWrapper>
  );
}
