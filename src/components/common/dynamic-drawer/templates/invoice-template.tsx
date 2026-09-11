import { InvoiceResponse, DocumentType } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DocumentStatusBadge,
  DownloadDocumentButton,
} from "@/components/client";
import { paymentMethodMap } from "@/constants";

interface InvoiceTemplateProps {
  type: DocumentType;
  data: InvoiceResponse;
  hideDueDate?: boolean;
  hideActions?: boolean;
  changeValue?: number;
}

export function InvoiceTemplate({
  type,
  data,
  hideDueDate,
  hideActions,
  changeValue,
}: InvoiceTemplateProps) {
  const isProforma =
    type === "proforma" ||
    data.invoiceType?.toUpperCase() === "PROFORMA" ||
    (data as any).type?.toUpperCase() === "PROFORMA" ||
    data.number?.toUpperCase().startsWith("FP");

  const documentTitle = isProforma
    ? "Factura Proforma"
    : data.invoiceType === "INVOICE_RECEIPT" || type === "invoice-receipt"
    ? "Factura-Recibo"
    : data.invoiceType === "RECEIPT" || type === "receipt"
    ? "Recibo"
    : data.invoiceType === "CREDIT_NOTE" || type === "credit-note"
    ? "Nota de Crédito"
    : "Factura";

  const clientNif =
    data.client?.taxNumber ||
    (data.client as any)?.nif ||
    (data as any)?.clientNif ||
    (data as any)?.nif;
  const clientPhone = data.client?.phone || (data as any)?.clientPhone;
  const clientEmail = data.client?.email || (data as any)?.clientEmail;
  const clientAddress = data.client?.address || (data as any)?.clientAddress;

  const retentionAmount = Number(
    (data as any).retentionAmount || (data as any).retention || 0
  );
  const discountAmount = Number(data.discountAmount || 0);
  const subtotal = Number(data.subtotal || 0);
  const taxAmount = Number(data.taxAmount || 0);
  const total = Number(data.total || 0);

  const paymentMethod =
    data.paymentMethod || (data as any).paymentMethodStr || (data as any).payment;
  const paymentLabel = paymentMethod
    ? paymentMethodMap[paymentMethod] || paymentMethod
    : null;

  const effectiveChange =
    changeValue !== undefined && changeValue > 0
      ? changeValue
      : Number((data as any).change || (data as any).changeAmount || 0);

  const receivedValue = Number(
    (data as any).receivedValue || (data as any).amountReceived || 0
  );

  const hash =
    (data as any).hash || (data as any).hash4 || (data as any).systemSignature;

  return (
    <div className="space-y-6 text-sm">
      {/* Header com Tipo, Número e Estado */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {documentTitle}
            </h2>
            {/* Factura Proforma não tem estado */}
            {!isProforma && data.status && (
              <DocumentStatusBadge status={data.status} />
            )}
          </div>
          <p className="text-muted-foreground font-mono font-medium">
            {data.number}
          </p>
          {!isProforma && paymentLabel && (
            <div className="pt-1">
              <Badge variant="outline" className="text-xs font-normal">
                {paymentLabel}
              </Badge>
            </div>
          )}
        </div>

        <div className="text-right space-y-1">
          <div>
            <p className="font-semibold text-xs text-muted-foreground uppercase">
              Emissão
            </p>
            <p className="font-medium">
              {formatDateTime((data as any).issueDate || data.createdAt)}
            </p>
          </div>
          {!hideDueDate && (data.dueDate || (data as any).proformaExpiresAt) && (
            <div>
              <p className="font-semibold text-xs text-muted-foreground uppercase mt-1">
                Vencimento
              </p>
              <p className="font-medium">
                {formatDateTime(data.dueDate || (data as any).proformaExpiresAt)}
              </p>
            </div>
          )}
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

      {/* Tabela de Itens */}
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
                Preço Unit.
              </th>
              <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider">
                IVA
              </th>
              <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.items?.map((item, idx) => {
              const itemPrice = Number(item.unitPrice || item.price || 0);
              const itemTotal = Number(item.total || itemPrice * item.quantity);

              // Resolução robusta da taxa de imposto/IVA
              const rawTax =
                (item as any).tax ??
                (item.item as any)?.tax ??
                (item as any).taxRate;
              let itemTaxRate: string | number | null = null;

              if (rawTax !== null && rawTax !== undefined) {
                if (typeof rawTax === "object") {
                  itemTaxRate =
                    rawTax.rate ?? rawTax.percentage ?? rawTax.value ?? null;
                } else {
                  itemTaxRate = rawTax;
                }
              }

              return (
                <tr
                  key={item.id || idx}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-foreground">
                      {item.name || (item.item as any)?.name}
                    </p>
                    {(item as any).code && (
                      <p className="text-[11px] font-mono text-muted-foreground">
                        Ref: {(item as any).code}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground font-mono">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-foreground">
                    {formatCurrency(itemPrice, data.currencyCode)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {itemTaxRate !== null &&
                    itemTaxRate !== undefined &&
                    itemTaxRate !== ""
                      ? `${itemTaxRate}%`
                      : "-"}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground">
                    {formatCurrency(itemTotal, data.currencyCode)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totais do Documento */}
      <div className="flex flex-col items-end gap-2">
        <div className="w-full sm:w-3/5 space-y-2 bg-card p-4 rounded-lg border">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono text-foreground">
              {formatCurrency(subtotal, data.currencyCode)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Desconto</span>
              <span className="font-mono">
                -{formatCurrency(discountAmount, data.currencyCode)}
              </span>
            </div>
          )}

          {taxAmount > 0 ? (
            <div className="flex justify-between text-green-600">
              <span>IVA Total</span>
              <span className="font-mono">
                +{formatCurrency(taxAmount, data.currencyCode)}
              </span>
            </div>
          ) : (
            <div className="flex justify-between text-muted-foreground">
              <span>Imposto (IVA)</span>
              <span className="font-mono">
                {formatCurrency(0, data.currencyCode)}
              </span>
            </div>
          )}

          {retentionAmount > 0 && (
            <div className="flex justify-between text-red-600 font-medium">
              <span>Retenção na Fonte</span>
              <span className="font-mono">
                -{formatCurrency(retentionAmount, data.currencyCode)}
              </span>
            </div>
          )}

          {!isProforma && receivedValue > 0 && (
            <div className="flex justify-between text-muted-foreground text-xs pt-1 border-t">
              <span>Valor Entregue / Recebido</span>
              <span className="font-mono">
                {formatCurrency(receivedValue, data.currencyCode)}
              </span>
            </div>
          )}

          {!isProforma && effectiveChange > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Troco</span>
              <span className="font-mono">
                {formatCurrency(effectiveChange, data.currencyCode)}
              </span>
            </div>
          )}

          <Separator className="my-1.5" />

          <div className="flex justify-between font-bold text-base pt-1">
            <span className="text-foreground">Total a Pagar</span>
            <span className="text-primary font-mono text-lg">
              {formatCurrency(total, data.currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Assinatura / Hash Fiscal AGT (Apenas se aplicável e não proforma) */}
      {!isProforma && hash && (
        <div className="text-[11px] font-mono text-muted-foreground bg-muted/30 p-2.5 rounded border">
          <span className="font-semibold text-foreground">
            Certificação AGT:{" "}
          </span>
          {hash}
        </div>
      )}

      {/* Notas e Observações */}
      {data.notes && (
        <div className="bg-muted/20 p-3 rounded-lg border">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-1">
            Notas & Observações
          </h3>
          <p className="text-foreground text-xs whitespace-pre-line">
            {data.notes}
          </p>
        </div>
      )}

      {/* Botões de Ação */}
      {!hideActions && (
        <div className="flex justify-end pt-2">
          <DownloadDocumentButton
            id={data.id}
            documentType={type}
            filenameBase={data.number}
          />
        </div>
      )}
    </div>
  );
}
