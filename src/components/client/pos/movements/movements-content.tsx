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
} from "@/components/ui";
import { ProformaList, InvoiceReceiptList, CreditNotesList } from "@/components";
import { currentStoreStore } from "@/stores";

type DocumentTab =
  | "invoice-receipt"
  | "proforma"
  | "credit-notes";

export function MovementsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentStore } = currentStoreStore();
  const activeTab = (searchParams.get("tab") as DocumentTab) ?? "invoice-receipt";

  const handleTabChange = useCallback(
    (value: DocumentTab | string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6 p-4 md:px-0">
      <div data-tour="pos-movements-header">
        <TitleList
          title="Movimentos"
          suTitle="Acompanhe todos os movimentos realizados na empresa"
        />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Scrollable tabs on mobile */}
          <div className="w-full overflow-x-auto scrollbar-none pb-1" data-tour="pos-movements-tabs">
            <TabsList className="flex w-max min-w-full justify-start p-1">
              <TabsTrigger value="invoice-receipt" className="whitespace-nowrap" defaultChecked>
                Factura Recibo
              </TabsTrigger>
              <TabsTrigger value="proforma" className="whitespace-nowrap">
                Proforma
              </TabsTrigger>
              <TabsTrigger value="credit-notes" className="whitespace-nowrap">
                Notas de Crédito
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="invoice-receipt" data-tour="pos-movements-list">
          <InvoiceReceiptList storeId={currentStore?.id} />
        </TabsContent>

        <TabsContent value="proforma" data-tour="pos-movements-list">
          <ProformaList storeId={currentStore?.id} />
        </TabsContent>

        <TabsContent value="credit-notes" data-tour="pos-movements-list">
          <CreditNotesList storeId={currentStore?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
