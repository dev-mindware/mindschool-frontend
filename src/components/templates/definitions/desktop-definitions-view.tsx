"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components";
import { cn } from "@/lib/utils";
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
 * Apresenta a coluna lateral vertical com categorias (Gerais e Ambiente Escolar)
 * e o painel de conteúdo expansível à direita.
 */
export function DesktopDefinitionsView({
  activeTab,
  enabledTabs,
  generalTabs,
  workplaceTabs,
  isMobile,
  onTabChange,
}: DesktopDefinitionsViewProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mindschool_def_sidebar_collapsed");
      if (saved === "true") {
        setIsSidebarCollapsed(true);
      }
    } catch {
      // LocalStorage pode não estar disponível em ambientes restritos
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mindschool_def_sidebar_collapsed", String(next));
      } catch {
        // Ignora erro de storage
      }
      return next;
    });
  };

  const renderTabTrigger = (tab: DefinitionTabItem) => {
    const isActive = activeTab === tab.id;
    return (
      <TabsTrigger
        key={tab.id}
        value={tab.id}
        className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none cursor-pointer"
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
            isActive ? "text-primary font-medium" : ""
          }`}
        >
          {tab.label}
        </p>
      </TabsTrigger>
    );
  };

  const activeTabItem = enabledTabs.find((t) => t.id === activeTab);

  return (
    <div className="hidden md:block">
      <h1 className="text-2xl font-semibold">Definições da Conta</h1>
      <Tabs
        value={activeTab}
        className="flex flex-row w-full mt-5 gap-4 items-start"
        onValueChange={onTabChange}
      >
        {/* Coluna Lateral de Separadores */}
        {!isSidebarCollapsed && (
          <div className="min-h-[600px] h-fit bg-sidebar rounded-[var(--radius-lg,0.75rem)] shrink-0 w-72 border border-border/50">
            <TabsList className="sticky top-0 flex-col gap-1 px-1 font-normal bg-transparent rounded-none w-full text-foreground">
              <div className="p-4 space-y-5 w-full">
                {generalTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide px-1 font-medium">
                      Gerais
                    </p>
                    <div data-tour="setup-general-tabs" className="space-y-1">
                      {generalTabs.map((tab) => renderTabTrigger(tab))}
                    </div>
                  </>
                )}
                {generalTabs.length > 0 && workplaceTabs.length > 0 && (
                  <div className="h-px bg-border/60 mx-1" />
                )}
                {workplaceTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide px-1 font-medium">
                      Ambiente Escolar
                    </p>
                    <div data-tour="setup-workplace-tabs" className="space-y-1">
                      {workplaceTabs.map((tab) => renderTabTrigger(tab))}
                    </div>
                  </>
                )}
              </div>
            </TabsList>
          </div>
        )}

        {/* Painel de Conteúdo Expansível (Full-Width quando recolhido) */}
        <div
          className={cn(
            "border rounded-[var(--radius-lg,0.75rem)] grow min-w-0 text-start bg-card shadow-xs transition-all duration-300",
            isSidebarCollapsed && "w-full"
          )}
          data-tour="setup-active-content"
        >
          {/* Barra de Controlo do Ecrã (Expandir / Recolher Barra Lateral) */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-2">
              {isSidebarCollapsed && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                  title="Mostrar menu lateral das definições"
                >
                  <Icon name="PanelLeftOpen" className="size-4 text-primary" />
                  <span>Menu de definições</span>
                </Button>
              )}
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {activeTabItem?.label ?? "Configurações"}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title={
                isSidebarCollapsed
                  ? "Restaurar menu lateral das definições"
                  : "Expandir conteúdo a ecrã inteiro"
              }
            >
              <Icon
                name={isSidebarCollapsed ? "Minimize2" : "Maximize2"}
                className="size-3.5"
              />
              <span>
                {isSidebarCollapsed ? "Restaurar menu" : "Expandir ecrã"}
              </span>
            </Button>
          </div>

          {/* Conteúdo da Tab Activa */}
          {!isMobile &&
            enabledTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="py-4 sm:p-6 mt-0">
                {tab.component}
              </TabsContent>
            ))}
        </div>
      </Tabs>
    </div>
  );
}
