"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button, EmptyState, Icon, Input } from "@/components";
import { cn } from "@/lib/utils";
import { sanitizeSearchTerm, stripControlChars } from "@/schemas/helps";
import { normalize } from "@/utils/normalize-string";
import type { DefinitionTabItem } from "./types";

interface MobileDefinitionsViewProps {
  activeTab: string;
  activeTabObj: DefinitionTabItem;
  hasValidUrlTab: boolean;
  generalTabs: DefinitionTabItem[];
  workplaceTabs: DefinitionTabItem[];
  isMobile: boolean;
  onTabChange: (value: string) => void;
  onBackToHub: () => void;
}

/**
 * Vista Mobile das Definições (`block md:hidden`):
 * Segue o padrão Hub-and-Spoke:
 * - Quando nenhuma tab está seleccionada no URL (`!hasValidUrlTab`), apresenta o Settings Hub com pesquisa e cartões agrupados.
 * - Quando uma tab está activa (`?tab=...`), apresenta a barra superior com retorno ao Hub, Quick Switcher Bottom Sheet e o conteúdo da secção.
 */
export function MobileDefinitionsView({
  activeTab,
  activeTabObj,
  hasValidUrlTab,
  generalTabs,
  workplaceTabs,
  isMobile,
  onTabChange,
  onBackToHub,
}: MobileDefinitionsViewProps) {
  const [hubSearch, setHubSearch] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const q = normalize(sanitizeSearchTerm(hubSearch, 100));
  const filterHub = (list: DefinitionTabItem[]) =>
    !q
      ? list
      : list.filter((t) => normalize(`${t.label} ${t.description}`).includes(q));

  const filteredGeneral = filterHub(generalTabs);
  const filteredWorkplace = filterHub(workplaceTabs);

  const handleSelectSection = (id: string) => {
    setSwitcherOpen(false);
    onTabChange(id);
  };

  const renderMobileGroup = (
    title: string,
    items: DefinitionTabItem[],
    tourId?: string,
  ) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2" data-tour={tourId}>
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className="divide-y divide-border/60 rounded-xs border border-border bg-card shadow-2xs overflow-hidden">
          {items.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectSection(tab.id)}
              data-tour={`setup-tab-${tab.id}`}
              className="flex w-full items-center gap-3.5 p-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary">
                <Icon name={tab.icon} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {tab.label}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {tab.description}
                </p>
              </div>
              <Icon
                name="ChevronRight"
                className="size-4 shrink-0 text-muted-foreground/70"
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="block md:hidden">
      {!hasValidUrlTab ? (
        <div className="space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">
              Definições da Conta
            </h1>
            <p className="text-xs text-muted-foreground">
              Seleccione uma categoria para gerir a sua conta ou o ambiente escolar.
            </p>
          </div>

          <Input
            label=""
            startIcon="Search"
            maxLength={100}
            value={hubSearch}
            onChange={(e) => setHubSearch(stripControlChars(e.target.value).slice(0, 100))}
            placeholder="Pesquisar definição (ex.: palavra-passe, banco, notas)..."
            className="h-10 text-xs"
          />

          {filteredGeneral.length === 0 && filteredWorkplace.length === 0 ? (
            <EmptyState
              icon="SearchX"
              title="Nenhuma definição encontrada"
              description="Tente pesquisar por outro termo ou limpe a pesquisa."
            />
          ) : (
            <div className="space-y-6 pb-4">
              {renderMobileGroup("Gerais", filteredGeneral, "setup-general-tabs")}
              {renderMobileGroup(
                "Ambiente Escolar",
                filteredWorkplace,
                "setup-workplace-tabs",
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Barra de Navegação Móvel no Topo da Secção */}
          <div className="flex items-center justify-between gap-2 rounded-xs border border-border bg-card p-2 shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBackToHub}
              className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Icon name="ArrowLeft" className="size-3.5" />
              <span>Todas as definições</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSwitcherOpen(true)}
              className="h-8 max-w-[210px] gap-1.5 rounded-xs px-2.5 text-xs font-medium"
            >
              <Icon
                name={activeTabObj.icon}
                className="size-3.5 shrink-0 text-primary"
              />
              <span className="truncate">{activeTabObj.label}</span>
              <Icon
                name="ChevronDown"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
            </Button>
          </div>

          {/* Conteúdo da Secção Activa */}
          <div data-tour="setup-active-content" className="pt-1">
            {isMobile && activeTabObj.component}
          </div>

          {/* Bottom Sheet Quick Switcher para saltar directamente entre secções */}
          <Sheet open={switcherOpen} onOpenChange={setSwitcherOpen}>
            <SheetContent
              side="bottom"
              className="max-h-[82dvh] flex flex-col gap-0 p-0 rounded-t-xl border-t md:hidden"
            >
              <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
              <SheetHeader className="border-b px-4 py-3 text-left">
                <SheetTitle className="text-base font-semibold">
                  Mudar de secção
                </SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-5">
                {[
                  { title: "Gerais", items: generalTabs },
                  { title: "Ambiente Escolar", items: workplaceTabs },
                ]
                  .filter((g) => g.items.length > 0)
                  .map((group) => (
                    <div key={group.title} className="space-y-2">
                      <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {group.title}
                      </p>
                      <div className="divide-y divide-border/60 rounded-xs border border-border bg-card overflow-hidden">
                        {group.items.map((tab) => {
                          const isCurrent = tab.id === activeTab;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => handleSelectSection(tab.id)}
                              className={cn(
                                "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                                isCurrent
                                  ? "bg-primary/8 font-medium"
                                  : "hover:bg-muted/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center rounded-xs",
                                  isCurrent
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <Icon name={tab.icon} className="size-3.5" />
                              </span>
                              <span className="flex-1 truncate text-xs text-foreground">
                                {tab.label}
                              </span>
                              {isCurrent && (
                                <Icon
                                  name="Check"
                                  className="size-4 shrink-0 text-primary"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}

