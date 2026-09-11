"use client";
import {
  CreditNoteFormSkeleton,
  EmptyState,
  RequestError,
  TitleList,
} from "@/components/common";
import { useFetchById } from "@/hooks/common";
import { InvoiceDetails } from "@/types/credit-note";
import { ProformaForm } from "./proforma-form";
import { useRouter } from "next/navigation";

export function ProformaEditContent({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useFetchById<InvoiceDetails>(
    "invoice-proforma",
    "/invoice/proforma",
    invoiceId
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TitleList
          title="Editar Proforma"
          suTitle="Edite a proforma antes de a converter em factura."
        />
        <CreditNoteFormSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <RequestError
        refetch={refetch}
        message="Erro ao carregar os dados da factura. Verifique a ligação à Internet."
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon="FileDiff"
        description="A factura não foi encontrada ou o identificador é inválido."
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div data-tour="proforma-edit-header">
        <TitleList
          title="Editar Proforma"
          suTitle={`Referente à proforma: ${data.id.slice(-8)}`}
        />
      </div>

      <ProformaForm
        action="edit"
        id={invoiceId}
        initialData={data}
        onSuccess={() => {
          router.replace("/documents?tab=proforma");
        }}
      />
    </div>
  );
}
