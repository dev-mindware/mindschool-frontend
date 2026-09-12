import { PageWrapper, SchoolModulePlaceholder } from "@/components";

export default function TuitionInvoicesPage() {
  return (
    <PageWrapper
      routePath="/tuition"
      routeLabel="Propinas & Finanças"
      subRoute="Facturas & Recibos"
    >
      <SchoolModulePlaceholder
        title="Facturas & Recibos Certificados"
        subtitle="Emissão fiscal em tempo real com validação e hash AGT."
        icon="Receipt"
        description="Geração síncrona de facturas-recibos com número de série fiscal e hash certificado pela Administração Geral Tributária (AGT). Conformidade fiscal garantida e dados prontos para exportação SAF-T."
        badge="Certificação AGT"
        primaryActionLabel="Emitir Factura-Recibo"
        primaryActionIcon="Plus"
        secondaryActionLabel="Exportar SAF-T"
        secondaryActionIcon="FileCode"
        stats={[
          { label: "Documentos Emitidos", value: "1.144", subtext: "Série 2026/FT", icon: "FileText" },
          { label: "Comunicação AGT", value: "100%", subtext: "Em tempo real", icon: "CircleCheck" },
          { label: "Total Faturado", value: "18.450.000 Kz", subtext: "Com hash fiscal", icon: "BadgePercent" },
          { label: "Isenções de IVA", value: "Art. 12.º", subtext: "Regime de Ensino", icon: "ShieldCheck" },
        ]}
      />
    </PageWrapper>
  );
}
