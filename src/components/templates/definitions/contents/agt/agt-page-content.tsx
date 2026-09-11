"use client";

import { Icon, TitleList } from "@/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgtActions } from "@/hooks/agt";
import type { AgtTab } from "@/types";
import { useSearchParams } from "next/navigation";
import { AgtSeriesList } from "./agt-series-list";
import { AgtInvoiceList } from "./agt-invoice-list";
import { AgtConsultation } from "./agt-consultation";
import { AgtKeySettings } from "./agt-key-settings";
import { AgtErrorsList } from "./agt-errors-list";

const AGT_TABS = [
  {
    value: "series" as const,
    label: "Séries",
    icon: "ListOrdered" as const,
  },
  {
    value: "repository" as const,
    label: "Repositório",
    icon: "Search" as const,
  },
  {
    value: "consultation" as const,
    label: "Consulta",
    icon: "FileSearch" as const,
  },
  {
    value: "errors" as const,
    label: "Erros Fiscais",
    icon: "TriangleAlert" as const,
  },

  {
    value: "settings" as const,
    label: "Configurações",
    icon: "Settings" as const,
  },
];

function isAgtTab(value: string | null): value is AgtTab {
  return (
    value === "series" ||
    value === "repository" ||
    value === "consultation" ||
    value === "errors" ||
    value === "settings"
  );
}


export function AgtPageContent() {
  const searchParams = useSearchParams();
  const { setAgtTab } = useAgtActions();
  const rawTab = searchParams.get("agtTab");
  const activeTab: AgtTab = isAgtTab(rawTab) ? rawTab : "series";

  return (
    <div data-tour="setup-agt-content">
      <TitleList
        title="AGT"
        suTitle="Gira séries, documentos e validações fiscais da Administração Geral Tributária."
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setAgtTab(value as AgtTab)}
        className="mt-6 w-full"
      >
        <div className="relative -mx-1 overflow-x-auto px-1">
          <TabsList className="inline-flex h-auto w-max min-w-full justify-start gap-1 rounded-md bg-muted/40 p-1 sm:w-auto sm:min-w-0">
            {AGT_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="min-w-max gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon name={tab.icon} className="h-4 w-4 text-muted-foreground" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="series" className="m-0 border-none p-0 outline-none">
          <AgtSeriesList />
        </TabsContent>
        <TabsContent
          value="repository"
          className="m-0 border-none p-0 outline-none"
        >
          <AgtInvoiceList />
        </TabsContent>
        <TabsContent
          value="consultation"
          className="m-0 border-none p-0 outline-none"
        >
          <AgtConsultation />
        </TabsContent>
        <TabsContent
          value="errors"
          className="m-0 border-none p-0 outline-none"
        >
          <AgtErrorsList />
        </TabsContent>
        <TabsContent
          value="settings"
          className="m-0 border-none p-0 outline-none"
        >
          <AgtKeySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

