"use client";

import { Icon } from "@/components/common/icon";
import type { ModuleId, NavModule } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface MobileCompactBarProps {
  compactModules: NavModule[];
  activeModuleId?: ModuleId;
  openModuleId: ModuleId | null;
  canExpand: boolean;
  isExpanded: boolean;
  dropdownId: string;
  expandedPanelId: string;
  onSelectModule: (mod: NavModule) => void;
  onToggleExpand: () => void;
}

/**
 * Barra inferior compacta da Navbar Mobile:
 * Apresenta até 4 módulos (o módulo activo/seleccionado em formato pílula com ícone + nome, os restantes só com ícone)
 * e o botão de seta (`ChevronUp`) para expandir ou recolher todos os módulos.
 */
export function MobileCompactBar({
  compactModules,
  activeModuleId,
  openModuleId,
  canExpand,
  isExpanded,
  dropdownId,
  expandedPanelId,
  onSelectModule,
  onToggleExpand,
}: MobileCompactBarProps) {
  return (
    <div className="flex items-center justify-between gap-1 px-2 py-1.5">
      <div className="flex flex-1 items-center justify-around gap-1 min-w-0">
        {compactModules.map((mod) => {
          const isModActive = activeModuleId === mod.id;
          const isModOpen = openModuleId === mod.id;
          const isHighlighted = openModuleId ? isModOpen : isModActive;

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod)}
              aria-label={mod.label}
              aria-current={isModActive ? "page" : undefined}
              aria-expanded={mod.pageCount > 1 ? isModOpen : undefined}
              aria-controls={
                mod.pageCount > 1 && isModOpen ? dropdownId : undefined
              }
              className={cn(
                "relative flex h-11 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isHighlighted
                  ? "bg-primary text-primary-foreground px-3.5 gap-2 shadow-xs max-w-[10.5rem]"
                  : "w-11 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon name={mod.icon} className="size-5 shrink-0" />
              {isHighlighted && (
                <span className="truncate text-xs font-semibold tracking-tight">
                  {mod.label}
                </span>
              )}
              {!isHighlighted && isModActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      {canExpand && (
        <div className="flex items-center border-l border-border/70 pl-1.5">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={
              isExpanded ? "Recolher módulos" : "Mostrar todos os módulos"
            }
            aria-expanded={isExpanded}
            aria-controls={expandedPanelId}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isExpanded
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon
              name="ChevronUp"
              className={cn(
                "size-4 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </button>
        </div>
      )}
    </div>
  );
}

