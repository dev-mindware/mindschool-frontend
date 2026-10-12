"use client";

import {
  Icon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/auth";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { ROLE_LABELS } from "@/constants/roles";
import { pickPrimaryRole } from "@/utils/api-roles";
import { SchoolLogo } from "@/components/common/logo/school-logo";

function useSchoolSwitcher() {
  const { schoolId, memberships, selectSchool } = useActiveSchoolStore();
  const currentUnit = memberships.find((m) => m.schoolId === schoolId) || memberships[0];
  // Trocar de escola muda papel, plano e dados: recarrega a aplicacao.
  const switchSchool = (id: string) => {
    if (id === schoolId) return;
    selectSchool(id);
    window.location.reload();
  };
  return { memberships, currentUnit, switchSchool };
}

function SchoolMenu({ memberships, onSwitch, side }: { memberships: ReturnType<typeof useSchoolSwitcher>["memberships"]; onSwitch: (id: string) => void; side: "right" | "bottom" }) {
  return (
    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="start" side={side} sideOffset={4}>
      <DropdownMenuLabel className="text-xs text-muted-foreground">As minhas escolas</DropdownMenuLabel>
      {memberships.map((m) => (
        <DropdownMenuItem key={m.schoolId} onClick={() => onSwitch(m.schoolId)} className="gap-2 p-2 cursor-pointer">
          <div className="flex items-center justify-center overflow-hidden border rounded-md size-6 bg-white dark:bg-zinc-900">
            {m.logoPath ? <SchoolLogo path={m.logoPath} name={m.schoolName} size={20} /> : <Icon name="School" className="size-3.5 shrink-0" />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{m.schoolName}</span>
            <span className="text-[10px] text-muted-foreground">{ROLE_LABELS[pickPrimaryRole(m.roles) ?? "GUARDIAN"]}</span>
          </div>
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}

/** Escola activa e troca de escola, em formato de botão do rail (só o ícone). */
export function SchoolRailButton() {
  const { memberships, currentUnit, switchSchool } = useSchoolSwitcher();
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Escola activa"
              className="flex size-9 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 dark:bg-zinc-900 dark:border dark:border-white/10"
            >
              <SchoolLogo path={currentUnit?.logoPath} name={currentUnit?.schoolName} size={24} />
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">{currentUnit?.schoolName ?? "Escola"}</TooltipContent>
      </Tooltip>
      <SchoolMenu memberships={memberships} onSwitch={switchSchool} side="right" />
    </DropdownMenu>
  );
}

export function SidebarCompanyInfo() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { memberships, currentUnit, switchSchool } = useSchoolSwitcher();

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center justify-center rounded-lg p-1 aspect-square size-8 shrink-0 bg-sidebar-accent/60 dark:bg-sidebar-accent">
                <SchoolLogo path={currentUnit?.logoPath} name={currentUnit?.schoolName} size={24} />
              </div>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">
                  {currentUnit?.schoolName || user?.company?.name || "MindSchool"}
                </span>
                <span className="text-xs truncate text-muted-foreground">
                  {currentUnit ? (ROLE_LABELS[pickPrimaryRole(currentUnit.roles) ?? "GUARDIAN"] ?? "") : "Unidade Escolar"}
                </span>
              </div>
              <Icon name="ChevronsUpDown" className="ml-auto size-4 shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <SchoolMenu memberships={memberships} onSwitch={switchSchool} side={isMobile ? "bottom" : "right"} />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}