"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components";
import type { DefinitionTabItem } from "./types";

interface DesktopDefinitionsViewProps {
  activeTab: string;
  enabledTabs: DefinitionTabItem[];
  generalTabs: DefinitionTabItem[];
  workplaceTabs: DefinitionTabItem[];
  isMobile: boolean;
  onTabChange: (value: string) => void;
}

/**
 * Vista Desktop das Definições (`hidden md:block`):
 * Apresenta a coluna lateral vertical com categorias (Gerais e Ambiente Escolar) e o painel de conteúdo à direita.
 */
export function DesktopDefinitionsView({
  activeTab,
  enabledTabs,
  generalTabs,
  workplaceTabs,
  isMobile,
  onTabChange,
}: DesktopDefinitionsViewProps) {
  const renderTabTrigger = (tab: DefinitionTabItem) => (
    <TabsTrigger
      key={tab.id}
      value={tab.id}
      className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
      data-tour={`setup-tab-${tab.id}`}
    >
      <Icon
        name={tab.icon}
        className="-ms-0.5 me-1.5 opacity-60 text-primary"
        size={16}
        aria-hidden="true"
      />
      <p
        className={`font-normal ${
          activeTab === tab.id ? "text-primary font-medium" : ""
        }`}
      >
        {tab.label}
      </p>
    </TabsTrigger>
  );

  return (
    <div className="hidden md:block">
      <h1 className="text-2xl font-semibold">Definições da Conta</h1>
      <Tabs
        value={activeTab}
        className="flex-row w-full mt-5"
        onValueChange={onTabChange}
      >
        <div className="h-screen bg-sidebar rounded-xs">
          <TabsList className="sticky top-0 flex-col gap-1 px-1 font-normal bg-transparent rounded-none w-75 text-foreground">
            <div className="p-4 space-y-5">
              {generalTabs.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Gerais
                  </p>
                  <div data-tour="setup-general-tabs">
                    {generalTabs.map((tab) => renderTabTrigger(tab))}
                  </div>
                </>
              )}
              {generalTabs.length > 0 && workplaceTabs.length > 0 && (
                <div className="h-px bg-border" />
              )}
              {workplaceTabs.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Ambiente Escolar
                  </p>
                  <div data-tour="setup-workplace-tabs">
                    {workplaceTabs.map((tab) => renderTabTrigger(tab))}
                  </div>
                </>
              )}
            </div>
          </TabsList>
        </div>

        <div
          className="border rounded-xs grow min-w-0 text-start"
          data-tour="setup-active-content"
        >
          {!isMobile &&
            enabledTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="py-4 sm:p-6">
                {tab.component}
              </TabsContent>
            ))}
        </div>
      </Tabs>
    </div>
  );
}

