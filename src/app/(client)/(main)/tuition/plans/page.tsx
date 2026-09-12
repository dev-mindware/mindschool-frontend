import { PageWrapper, SchoolModulePlaceholder } from "@/components";

export default function TuitionPlansPage() {
  return (
    <PageWrapper
      routePath="/tuition"
      routeLabel="Propinas & Finanças"
      subRoute="Tabelas de Preço"
    >
      <SchoolModulePlaceholder
        title="Tabelas de Preço & Taxas"
        subtitle="Configuração de propinas por classe, taxas de matrícula, transporte e cantina."
        icon="Coins"
        description="Defina preçários diferenciados por nível de ensino (Pré-escolar, Primário, Secundário, Técnico), planos de desconto para irmãos e políticas de juros de mora."
        badge="Financeiro"
        primaryActionLabel="Nova Tabela"
        primaryActionIcon="Plus"
        secondaryActionLabel="Políticas de Desconto"
        secondaryActionIcon="Percent"
        stats={[
          { label: "Tabelas Activas", value: "4", subtext: "Por ciclo de ensino", icon: "Layers" },
          { label: "Serviços Adicionais", value: "8", subtext: "Transporte, cantina, etc.", icon: "CirclePlus" },
          { label: "Descontos para Irmãos", value: "10% a 25%", subtext: "Configurado no sistema", icon: "Users" },
          { label: "Mora Padrão", value: "5%", subtext: "Após dia 10 de cada mês", icon: "Clock" },
        ]}
      />
    </PageWrapper>
  );
}
