"use client";
import {
  CreditNoteFormSkeleton,
  EmptyState,
  RequestError,
  TitleList,
} from "@/components/common";
import { useFetchById } from "@/hooks/common";
import { CreditNoteForm } from "./credit-notes-form";
import { InvoiceDetails } from "@/types/credit-note";

type CreditNotesProps = {
  invoiceType?: "invoice-receipt" | "invoice-normal";
  invoiceId: string;
};

export function CreditNotes({ invoiceId, invoiceType }: CreditNotesProps) {
  const { data, isLoading, isError, refetch } = useFetchById<InvoiceDetails>(
    "invoice",
    invoiceType === "invoice-receipt" ? "/invoice/invoice-receipt" : "/invoice/normal",
    invoiceId
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TitleList
          title="Notas de Crédito"
          suTitle="Emita notas de crédito referentes às suas facturas."
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
      <TitleList
        title="Notas de Crédito"
        suTitle={`Referente à factura: ${data.invoiceNumber}`}
      />
      <CreditNoteForm invoice={data} docType={invoiceType} />
    </div>
  );
}
