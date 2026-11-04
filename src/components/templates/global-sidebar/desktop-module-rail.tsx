"use client";

import { Icon } from "@/components/common/icon";
import type { NavModule } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import { SchoolRailButton } from "./sidebar-info";
import { UserInfo } from "./user-info";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** O rail flutua (3,5 rem de pílula + 0,5 rem de margem de cada lado), solto dos cantos do ecrã. */
export const RAIL_WIDTH = "4.5rem";

/**
 * Vista Desktop do Rail de Módulos (`group-data-[collapsible=icon]:hidden`).
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
      {/* pílula flutuante estilizada via tokens semânticos do rail modular */}
      <nav
        aria-label="Módulos"
        className="flex h-full flex-col items-center justify-between rounded-lg bg-[var(--rail)] py-4 text-[var(--rail-foreground)] shadow-lg"
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
            "flex size-11 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            active
              ? "bg-[var(--rail-active-bg)] text-[var(--rail-active)] shadow-sm ring-1 ring-white/25"
              : "text-[var(--rail-foreground)]/70 hover:bg-[var(--rail-hover)] hover:text-[var(--rail-foreground)]",
          )}
        >
          <Icon name={module.icon} className="size-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{module.label}</TooltipContent>
    </Tooltip>
  );
}

