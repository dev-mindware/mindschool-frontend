"use client";
import Link from "next/link";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TitleList } from "@/components/common";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { InvoiceList } from "./invoice-normal";
import { ProformaList } from "./invoice-proforma";
import { InvoiceReceiptList } from "./invoice-receipt";
import { ReceiptList } from "./receipts";
import { CreditNotesList } from "./credits-notes";
import { cn } from "@/lib";
import { currentStoreStore } from "@/stores";
import { ProtectedAction } from "@/components/guards";

type DocumentTab =
  | "invoice"
  | "invoice-receipt"
  | "proforma"
  | "receipt"
  | "credit-notes";

export function DocumentList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentStore } = currentStoreStore();
  const activeTab = (searchParams.get("tab") as DocumentTab) ?? "invoice";

  const handleTabChange = useCallback(
    (value: DocumentTab | string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6">
      <div data-tour="documents-header">
        <TitleList
          title="Documentos"
          suTitle="Crie documentos que ajudarão no controlo das suas atividades"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="overflow-x-auto scrollbar-none pb-1" data-tour="documents-tabs">
            <TabsList className="flex w-max min-w-full justify-start p-1">
              <TabsTrigger value="invoice" className="whitespace-nowrap">
                Factura
              </TabsTrigger>
              <TabsTrigger value="invoice-receipt" className="whitespace-nowrap">
                Factura Recibo
              </TabsTrigger>
              <TabsTrigger value="proforma" className="whitespace-nowrap">
                Proforma
              </TabsTrigger>
              <TabsTrigger value="receipt" className="whitespace-nowrap">
                Recibos
              </TabsTrigger>
              <TabsTrigger value="credit-notes" className="whitespace-nowrap">
                Notas de Crédito
              </TabsTrigger>
            </TabsList>
          </div>

          <div data-tour="documents-create">
            <ProtectedAction>
              {activeTab === "credit-notes" ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-block w-full sm:w-auto">
                        <Button
                          className="w-full sm:w-auto disabled:cursor-not-allowed opacity-75"
                          disabled
                        >
                          Criar Documento
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-center p-2.5">
                      Para emitir uma Nota de Crédito, aceda à aba <strong>Factura</strong> ou <strong>Factura Recibo</strong> e clique nos 3 pontos (<strong>...</strong>) da factura pretendida.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Link
                  className="w-full sm:w-auto"
                  href={`/documents/new-doc?tab=${activeTab}`}
                >
                  <Button className="w-full sm:w-auto">
                    Criar Documento
                  </Button>
                </Link>
              )}
            </ProtectedAction>
          </div>
        </div>

        <TabsContent value="invoice" data-tour="documents-list">
          <InvoiceList storeId={currentStore?.id} />
        </TabsContent>

        <TabsContent value="proforma" data-tour="documents-list">
          <ProformaList storeId={currentStore?.id} />
        </TabsContent>

        <TabsContent value="invoice-receipt" data-tour="documents-list">
          <InvoiceReceiptList storeId={currentStore?.id} />
        </TabsContent>

        <TabsContent value="receipt" data-tour="documents-list">
          <ReceiptList storeId={currentStore?.id} />
        </TabsContent>

        <TabsContent value="credit-notes" data-tour="documents-list">
          <CreditNotesList storeId={currentStore?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
