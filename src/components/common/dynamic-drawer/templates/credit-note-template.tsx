import { CreditNotesResponse } from "@/types/credit-note";
import { formatCurrency, formatDateTime, creditNoteReasonLabel } from "@/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DocumentStatusBadge,
  DownloadDocumentButton,
} from "@/components/client/documents/common";

interface Props {
  data: CreditNotesResponse;
}

export function CreditNoteTemplate({ data }: Props) {
  const { invoice } = data;

  const clientNif =
    data.client?.taxNumber ||
    (data.client as any)?.nif ||
    (invoice as any)?.clientNif;
  const clientPhone = data.client?.phone;
  const clientEmail = data.client?.email;
  const clientAddress = data.client?.address;

  const invoiceRetention = Number((invoice as any)?.retentionAmount || 0);
  const invoiceDiscount = Number(invoice?.discountAmount ?? 0);
  const invoiceTax = Number(invoice?.taxAmount ?? 0);
  const invoiceSubtotal = Number(invoice?.subtotal ?? 0);
  const invoiceTotal = Number(invoice?.total ?? 0);

  const creditTotal =
    data.items?.reduce((acc, item) => acc + Number(item.total || 0), 0) ||
    Number((data as any).total || 0);

  const hash =
    (data as any).hash || (data as any).hash4 || (data as any).systemSignature;

  return (
    <div className="space-y-6 text-sm">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold uppercase tracking-wide">
              Nota de Crédito
            </h2>
            {data.status && <DocumentStatusBadge status={data.status} />}
          </div>
          <p className="text-muted-foreground font-mono font-medium">
            {data.number}
          </p>
          <div className="pt-1">
            <Badge variant="outline" className="text-xs">
              Factura Origem: {invoice.number}
            </Badge>
          </div>
        </div>

        <div className="text-right space-y-1">
          <p className="font-semibold text-xs text-muted-foreground uppercase">
            Data de Emissão
          </p>
          <p className="font-medium">{formatDateTime(data.createdAt)}</p>
        </div>
      </div>

      <Separator />

      {/* Dados do Cliente */}
      <div className="bg-muted/40 p-4 rounded-lg border space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Cliente
            </h3>
            <p className="font-semibold text-base text-foreground mt-0.5">
              {data.client?.name || "Consumidor Final"}
            </p>
          </div>
          {clientNif && (
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase">
                NIF / Contribuinte
              </span>
              <p className="font-mono font-medium text-foreground">{clientNif}</p>
            </div>
          )}
        </div>

        {(clientPhone || clientEmail || clientAddress) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t text-xs text-muted-foreground">
            {clientPhone && (
              <div>
                <span className="font-medium text-foreground">Tel: </span>
                {clientPhone}
              </div>
            )}
            {clientEmail && (
              <div>
                <span className="font-medium text-foreground">Email: </span>
                {clientEmail}
              </div>
            )}
            {clientAddress && (
              <div className="sm:col-span-2">
                <span className="font-medium text-foreground">Endereço: </span>
                {clientAddress}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Motivo */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-lg">
        <h3 className="font-semibold text-xs text-amber-700 uppercase tracking-wider mb-1">
          Motivo da Rectificação / Anulação
        </h3>
        <p className="text-sm font-medium text-foreground">
          {creditNoteReasonLabel(data.reason)}
        </p>
      </div>

      {/* Itens Creditados */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/70">
            <tr className="text-muted-foreground border-b text-[11px]">
              <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider">
                Item
              </th>
              <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider">
                Qtd
              </th>
              <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider">
                Preço
              </th>
              <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider">
                Total Creditado
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {data.items.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5 font-medium">
                  {item.name ?? item.itemsId}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                  {item.quantity}
                </td>
                <td className="px-3 py-2.5 text-right font-mono">
                  {formatCurrency(Number(item.price))}
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground">
                  {formatCurrency(Number(item.total))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumo da Factura e Crédito */}
      <div className="flex flex-col items-end gap-2">
        <div className="w-full sm:w-3/5 space-y-2 bg-card p-4 rounded-lg border">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal Factura:</span>
            <span className="font-mono">{formatCurrency(invoiceSubtotal)}</span>
          </div>

          {invoiceDiscount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Desconto:</span>
              <span className="font-mono">-{formatCurrency(invoiceDiscount)}</span>
            </div>
          )}

          {invoiceTax > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Imposto (IVA):</span>
              <span className="font-mono">+{formatCurrency(invoiceTax)}</span>
            </div>
          )}

          {invoiceRetention > 0 && (
            <div className="flex justify-between text-red-600 font-medium">
              <span>Retenção na Fonte:</span>
              <span className="font-mono">-{formatCurrency(invoiceRetention)}</span>
            </div>
          )}

          <Separator className="my-1" />

          <div className="flex justify-between font-semibold">
            <span>Total da Factura:</span>
            <span className="font-mono">{formatCurrency(invoiceTotal)}</span>
          </div>

          <div className="flex justify-between font-bold text-base pt-1 text-primary">
            <span>Total Creditado:</span>
            <span className="font-mono text-lg">
              {formatCurrency(creditTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Assinatura / Hash Fiscal AGT */}
      {hash && (
        <div className="text-[11px] font-mono text-muted-foreground bg-muted/30 p-2.5 rounded border">
          <span className="font-semibold text-foreground">
            Certificação AGT:{" "}
          </span>
          {hash}
        </div>
      )}

      {data.notes && (
        <div className="bg-muted/20 p-3 rounded-lg border">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
            Notas & Observações
          </h3>
          <p className="text-foreground text-xs whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <DownloadDocumentButton
          id={data.id}
          documentType="credit-note"
          filenameBase={data.number}
        />
      </div>
    </div>
  );
}
