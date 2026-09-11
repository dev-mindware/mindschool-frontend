"use client";

import {
  Appearance,
  Icon,
  OnboardingTourButton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components";
import { useRouter, useSearchParams } from "next/navigation";
import { PosGeneralSettings, PosWorkspaceSettings } from "./contents";
import { currentStoreStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { cashSessionsService } from "@/services";
import { cn } from "@/lib/utils";

type PosSettingsSetupProps = {
  showTourButton?: boolean;
};

export function PosSettingsSetup({
  showTourButton = false,
}: PosSettingsSetupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const { currentStore } = currentStoreStore();

  const tabs = [
    {
      id: "general",
      label: "Geral",
      icon: "Settings",
      component: (data: any) => (
        <PosGeneralSettings currentSession={data} />
      ),
    },
    {
      id: "workspace",
      label: "Workspace",
      icon: "Monitor",
      component: () => <PosWorkspaceSettings />,
    },
    {
      id: "appearance",
      label: "Aparência",
      icon: "Palette",
      component: () => <Appearance />,
    },
  ];

  const defaultTab = tabs[0].id;
  const activeTab =
    currentTab && tabs.some((tab) => tab.id === currentTab)
      ? currentTab
      : defaultTab;

  const { data: currentSession } = useQuery({
    queryKey: ["current-cash-session", currentStore?.id],
    queryFn: () => cashSessionsService.getCurrentSession(currentStore?.id),
    enabled: activeTab === "general",
    retry: false,
    refetchOnWindowFocus: true,
    // Reflete automaticamente a abertura assim que um gestor a aprova,
    // sem o utilizador ter de recarregar a página. Pára quando o caixa abre.
    refetchInterval: (query) => (query.state.data?.isOpen ? false : 15000),
  });

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  return (
    <div className="space-y-6 p-4 md:px-0" data-tour="pos-settings-layout">
      <div
        className="flex items-start justify-between gap-4"
        data-tour="pos-settings-header"
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black font-outfit tracking-tight">
            Definições
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerir as configurações do ponto de venda.
          </p>
        </div>

        {showTourButton && (
          <OnboardingTourButton tourId="pos-settings" className="shrink-0" />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex md:hidden flex-col gap-4">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList
              className="h-11 w-full justify-start inline-flex bg-muted/50 p-1 rounded-xl border border-border/50"
              data-tour="pos-settings-tabs"
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  data-tour={`pos-settings-tab-${tab.id}`}
                  className="whitespace-nowrap rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-sm font-medium"
                >
                  <Icon name={tab.icon as any} className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside
            className="hidden md:flex flex-col w-64 shrink-0 gap-1 p-1 bg-muted/30 rounded-2xl border border-border/50 self-start"
            data-tour="pos-settings-tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                data-tour={`pos-settings-tab-${tab.id}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  activeTab === tab.id
                    ? "bg-background text-primary shadow-sm border border-border/50"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon name={tab.icon as any} size={18} />
                {tab.label}
              </button>
            ))}
          </aside>

          <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-2 duration-300">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="outline-none m-0"
                data-tour={`pos-settings-content-${tab.id}`}
              >
                {tab.component(currentSession)}
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
