"use client";

import { Icon } from "@/components/common/icon";
import type { NavModule, NavigationModel } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { SchoolRailButton } from "./sidebar-info";
import { UserInfo } from "./user-info";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** O rail flutua (3,5 rem de pílula + 0,5 rem de margem de cada lado), solto dos cantos do ecrã. */
export const RAIL_WIDTH = "4.5rem";

/**
 * Vista Desktop do Rail de Módulos (`!isMobile`, `group-data-[collapsible=icon]:hidden`).
 */
export function DesktopModuleRail({
  top,
  bottom,
  active,
  onSelect,
}: {
  top: NavModule[];
  bottom: NavModule[];
  active: NavModule | undefined;
  onSelect: (m: NavModule) => void;
}) {
  return (
    <div
      className="shrink-0 p-2 group-data-[collapsible=icon]:hidden"
      style={{ width: RAIL_WIDTH }}
    >
      {/* pílula flutuante: no claro, a cor primária ofuscada; no escuro, quase preto */}
      <nav
        aria-label="Módulos"
        className="flex h-full flex-col items-center justify-between rounded-xs bg-[color-mix(in_oklab,var(--primary)_62%,black)] py-4 text-white shadow-lg dark:bg-black/45"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="mb-6">
            <SchoolRailButton />
          </div>
          {top.map((m) => (
            <RailButton
              key={m.id}
              module={m}
              active={active?.id === m.id}
              onClick={() => onSelect(m)}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-2">
          {bottom.map((m) => (
            <RailButton
              key={m.id}
              module={m}
              active={active?.id === m.id}
              onClick={() => onSelect(m)}
            />
          ))}
          <UserInfo compact />
        </div>
      </nav>
    </div>
  );
}

function RailButton({
  module,
  active,
  onClick,
}: {
  module: NavModule;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={module.label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex size-11 items-center justify-center rounded-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            active
              ? "bg-white/20 text-white shadow-sm ring-1 ring-white/25"
              : "text-white/70 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon name={module.icon} className="size-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{module.label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Vista Mobile de Chips de Módulos no topo da gaveta lateral (`isMobile`).
 */
export function MobileDrawerModuleChips({
  model,
  active,
  onSelect,
}: {
  model: NavigationModel;
  active: NavModule | undefined;
  onSelect: (m: NavModule) => void;
}) {
  return (
    <div
      className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
      role="tablist"
      aria-label="Módulos"
    >
      {model.modules.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={active?.id === m.id}
          onClick={() => onSelect(m)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
            active?.id === m.id
              ? "border-primary bg-primary/10 text-primary"
              : "text-muted-foreground",
          )}
        >
          <Icon name={m.icon} className="size-3.5" />
          {m.label}
        </button>
      ))}
    </div>
  );
}

