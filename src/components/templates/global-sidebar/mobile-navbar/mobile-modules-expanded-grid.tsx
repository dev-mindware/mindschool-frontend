"use client";

import { Icon } from "@/components/common/icon";
import type { ModuleId, NavModule } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface MobileModulesExpandedGridProps {
  id: string;
  modules: NavModule[];
  activeModuleId?: ModuleId;
  openModuleId: ModuleId | null;
  onSelectModule: (mod: NavModule) => void;
  onCollapse: () => void;
}

/**
 * Grelha expandida da Navbar Mobile:
 * Revelada ao clicar no botão de seta (`ChevronUp`), apresenta todos os módulos disponíveis para o utilizador.
 */
export function MobileModulesExpandedGrid({
  id,
  modules,
  activeModuleId,
  openModuleId,
  onSelectModule,
  onCollapse,
}: MobileModulesExpandedGridProps) {
  return (
    <div
      id={id}
      role="region"
      aria-label="Todos os módulos"
      className="max-h-[55svh] overflow-y-auto border-b border-border/70 p-2.5 animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Módulos ({modules.length})
        </span>
        <button
          type="button"
          onClick={onCollapse}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Recolher
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {modules.map((mod) => {
          const isModActive = activeModuleId === mod.id;
          const isModOpen = openModuleId === mod.id;
          const highlighted = isModOpen || isModActive;

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelectModule(mod)}
              aria-current={isModActive ? "page" : undefined}
              aria-expanded={mod.pageCount > 1 ? isModOpen : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2.5 rounded-xs border px-3 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                highlighted
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border/70 bg-background text-foreground hover:bg-muted",
              )}
            >
              <Icon
                name={mod.icon}
                className={cn(
                  "size-4 shrink-0",
                  highlighted
                    ? "text-primary-foreground"
                    : "text-muted-foreground",
                )}
              />
              <span className="flex-1 truncate">{mod.label}</span>
              {mod.pageCount > 1 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    highlighted
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {mod.pageCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

