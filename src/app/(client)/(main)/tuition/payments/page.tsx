import { PageWrapper, SchoolModulePlaceholder } from "@/components";

export default function TuitionPaymentsPage() {
  return (
    <PageWrapper
      routePath="/tuition/payments"
      routeLabel="Propinas & Finanças"
      subRoute="Propinas"
    >
      <SchoolModulePlaceholder
        title="Gestão de Propinas"
        subtitle="Controlo financeiro de mensalidades por aluno, turma e ano lectivo."
        icon="BadgePercent"
        description="Painel de controlo de propinas, acompanhamento de mensalidades pagas e em atraso, registo de pagamentos e emissão imediata de recibos."
        badge="Tesouraria"
        primaryActionLabel="Registar Pagamento"
        primaryActionIcon="CreditCard"
        secondaryActionLabel="Exportar Balancete"
        secondaryActionIcon="Download"
        stats={[
          { label: "Arrecadação do Mês", value: "18.450.000 Kz", subtext: "+12.4% vs mês anterior", icon: "TrendingUp" },
          { label: "Taxa de Cobrança", value: "92.2%", subtext: "1.144 de 1.240 alunos", icon: "CircleCheck" },
          { label: "Mensalidades Vencidas", value: "68", subtext: "Aviso enviado", icon: "CircleAlert" },
          { label: "Valor Pendente", value: "3.450.000 Kz", subtext: "Previsão de entrada", icon: "Clock" },
        ]}
      />
    </PageWrapper>
  );
}
