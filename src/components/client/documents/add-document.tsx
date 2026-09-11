"use client";
import { useCallback, useState, useEffect } from "react";
import { TitleList } from "@/components/common";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceForm } from "./invoice-normal";
import { InvoiceReceiptForm } from "./invoice-receipt";
import { ProformaForm } from "./invoice-proforma";
import { DocumentSuccessModal } from "./modals/document-success-modal";
import { BankModal } from "@/components/templates/definitions/contents/banks/banks-modals";
import { useAuth } from "@/hooks/auth";
import { useModal } from "@/stores";
import { SubscriptionStatus } from "@/types";

type TabsAloweds = "invoice" | "invoice-receipt" | "proforma";

export function AddDocuments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current_Tab = useSearchParams().get("tab");
  const { subscriptionStatus, isAuthenticating, user } = useAuth();
  const { openModal } = useModal();

  const [currentTab] = useState<TabsAloweds>(() => {
    if (current_Tab && (current_Tab === "invoice" || current_Tab === "invoice-receipt" || current_Tab === "proforma")) {
      return current_Tab as TabsAloweds;
    }
    return "invoice";
  });

  const handleTabChange = useCallback(
    (value: TabsAloweds | string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (isAuthenticating) return;
    if (!user) return;

    const hasActiveSubscription =
      subscriptionStatus === SubscriptionStatus.ACTIVE ||
      subscriptionStatus === SubscriptionStatus.TRIALING;

    if (!hasActiveSubscription) {
      if (subscriptionStatus === SubscriptionStatus.PENDING) {
        openModal("pending-subscription-modal");
      } else {
        openModal("subscription-expired-modal");
      }
      router.replace("/documents");
    }
  }, [subscriptionStatus, isAuthenticating, user, openModal, router]);

  if (isAuthenticating || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasActiveSubscription =
    subscriptionStatus === SubscriptionStatus.ACTIVE ||
    subscriptionStatus === SubscriptionStatus.TRIALING;

  if (!hasActiveSubscription) {
    return null;
  }

  return (
    <div className="space-y-6">
      <TitleList
        title="Documentos"
        suTitle="Crie documentos que ajudaram no controlo das suas atividades."
      />

      <Tabs
        className="w-full"
        defaultValue={currentTab}
        onValueChange={handleTabChange}
      >
        <TabsList
          className="flex justify-center md:justify-start"
          data-tour="normal-invoice-document-type"
        >
          <TabsTrigger value="invoice">Factura</TabsTrigger>
          <TabsTrigger value="invoice-receipt">Factura Recibo</TabsTrigger>
          <TabsTrigger value="proforma">Proforma</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice">
          <InvoiceForm />
        </TabsContent>
        <TabsContent value="invoice-receipt">
          <InvoiceReceiptForm />
        </TabsContent>
        <TabsContent value="proforma">
          <ProformaForm />
        </TabsContent>
      </Tabs>

      <DocumentSuccessModal />
      {/* Mounted outside document forms to avoid nested <form> submitting the invoice */}
      <BankModal action="add" />
    </div>
  );
}
