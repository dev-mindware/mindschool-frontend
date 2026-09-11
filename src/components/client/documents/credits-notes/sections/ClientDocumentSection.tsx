"use client";

import Link from "next/link";
import type { UseFormRegister } from "react-hook-form";
import type { CreditNoteFormData } from "@/schemas";
import type { Client } from "@/types/clients";
import { Button, Icon, Input } from "@/components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CONSUMIDOR_FINAL_CLIENT } from "@/utils/credit-notes";

interface ClientDocumentSectionProps {
  register: UseFormRegister<CreditNoteFormData>;
  errors: any;
  isInvoiceDoc: boolean;
  docType?: "invoice-receipt" | "invoice-normal";
  client?: Client;
}

export function ClientDocumentSection({
  register,
  errors,
  isInvoiceDoc,
  docType,
  client,
}: ClientDocumentSectionProps) {
  // Sem cliente registado (factura ao consumidor final), mostra os dados genéricos.
  const c: any = client ?? CONSUMIDOR_FINAL_CLIENT;
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Cliente do documento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A nota de crédito mantém o cliente associado ao documento original.
          </p>
        </div>
        <Button asChild type="button" variant="outline" size="sm" className="gap-2">
          <Link href="/clients">
            <Icon name="Users" size={16} />
            Ir para clientes
          </Link>
        </Button>
      </div>

      <Alert className="mb-5 border-primary/20 bg-primary/5">
        <Icon name="Info" className="h-4 w-4 text-primary" />
        <AlertTitle>Alteração dos dados do cliente</AlertTitle>
        <AlertDescription>
          Para alterar o nome, NIF, telefone ou endereço, aceda à página de
          clientes e edite o respectivo registo. Depois, volte a emitir a nota
          de crédito.
        </AlertDescription>
      </Alert>

      <input type="hidden" {...register("invoiceBody.client.id")} />
      <input type="hidden" {...register("invoiceBody.client.name")} />
      <input type="hidden" {...register("invoiceBody.client.taxNumber")} />
      <input type="hidden" {...register("invoiceBody.client.phone")} />
      <input type="hidden" {...register("invoiceBody.client.email")} />
      <input type="hidden" {...register("invoiceBody.client.address")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Nome" value={c.name || "Consumidor Final"} readOnly />
        <Input label="NIF" value={c.taxNumber || "Não informado"} readOnly />
        <Input label="Email" value={c.email || "Não informado"} readOnly />
        <Input label="Telefone" value={c.phone || "Não informado"} readOnly />
        <Input label="Endereço" value={c.address || "Não informado"} readOnly />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input
          type="date"
          label="Data de emissão"
          {...register("invoiceBody.issueDate")}
          error={errors.invoiceBody?.issueDate?.message}
        />
        {isInvoiceDoc && docType !== "invoice-receipt" && (
          <Input
            type="date"
            label="Data de vencimento"
            {...register("invoiceBody.dueDate")}
            error={errors.invoiceBody?.dueDate?.message}
          />
        )}
      </div>
    </section>
  );
}
