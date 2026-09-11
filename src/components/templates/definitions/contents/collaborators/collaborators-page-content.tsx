"use client";
import { useState } from "react";
import { FeatureGate, TitleList } from "@/components/common";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
} from "@/components/ui";
import { useAuthStore, useModal } from "@/stores";
import { ManagerList, ManagerModal } from "./manager";
import { CashierList, CashierModal } from "./cashier";

type CollaboratorTab = "manager" | "cashier";

export function CollaboratorsPageContent() {
  const { openModal } = useModal();
  const { user } = useAuthStore()
  const [currentTab, setCurrentTab] = useState<CollaboratorTab>(user?.role === "OWNER" ? "manager" : "cashier");

  const entityLabels: Record<CollaboratorTab, string> = {
    manager: "Gerente",
    cashier: "Caixa",
  };

  const entityModals: Record<CollaboratorTab, string> = {
    manager: "add-manager",
    cashier: "add-cashier",
  };

  const currentLabel = `Novo ${entityLabels[currentTab]}`;
  const currentModal = entityModals[currentTab];

  return (
    <div className="space-y-6">
      <TitleList
        title="Colaboradores"
        suTitle="Crie colaboradores que ajudarão no controlo das suas atividades"
      />

      <Tabs defaultValue={currentTab} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full">
          <TabsList className="flex flex-wrap justify-center sm:justify-start gap-2">

          {user?.role === "OWNER" && (
            <TabsTrigger
              value="manager"
              onClick={() => setCurrentTab("manager")}
              className="text-sm sm:text-base"
            >
              Gerente
            </TabsTrigger>
          )}

          <FeatureGate minPlan="Smart" fallback="disabled">
            <TabsTrigger
              value="cashier"
              onClick={() => setCurrentTab("cashier")}
              className="text-sm sm:text-base"
            >
              Caixa
            </TabsTrigger>
          </FeatureGate>
          </TabsList>

          <Button
            onClick={() => openModal(currentModal)}
            variant="default"
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            {currentLabel}
          </Button>
        </div>

        <div className="mt-4">
          <TabsContent value="manager">
            <ManagerList />
          </TabsContent>
          <TabsContent value="cashier">
            <CashierList />
          </TabsContent>
        </div>
      </Tabs>

      <ManagerModal action="add" />
      <CashierModal action="add" />
    </div>
  );
}