"use client";

import type { ReactNode } from "react";
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
import { useSchool } from "@/providers/school-provider";
import { ROLE_LABELS } from "@/constants/roles";
import { pickPrimaryRole } from "@/utils/api-roles";
import { MindSchoolLogo } from "@/components/common/logo/mindschool-logo";

function SchoolMenu({ side }: { side: "right" | "bottom" }) {
  const { schools, current, switchSchool } = useSchool();
  return (
    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" align="start" side={side} sideOffset={4}>
      <DropdownMenuLabel className="text-xs text-muted-foreground">As minhas escolas</DropdownMenuLabel>
      {schools.map((m) => (
        <DropdownMenuItem key={m.schoolId} onClick={() => switchSchool(m.schoolId)} className="gap-2 p-2 cursor-pointer">
          <div className="flex items-center justify-center border rounded-md size-6">
            <Icon name="School" className="size-3.5 shrink-0" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">{m.schoolName}</span>
            <span className="text-[10px] text-muted-foreground">{ROLE_LABELS[pickPrimaryRole(m.roles) ?? "GUARDIAN"]}{m.viaGroup ? " · via grupo" : ""}</span>
          </div>
          {m.schoolId === current?.schoolId && <Icon name="Check" className="ml-auto size-4 text-primary" />}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}

/** O menu de troca só existe com mais do que uma escola; com uma só, o botão mostra a escola sem abrir nada. */
function SwitcherShell({ side, children }: { side: "right" | "bottom"; children: (trigger: { asTrigger: boolean }) => ReactNode }) {
  const { hasMultiple } = useSchool();
  if (!hasMultiple) return <>{children({ asTrigger: false })}</>;
  return (
    <DropdownMenu>
      {children({ asTrigger: true })}
      <SchoolMenu side={side} />
    </DropdownMenu>
  );
}

/** Escola ativa e troca de escola, em formato de botão do rail (só o ícone). */
export function SchoolRailButton() {
  const { current } = useSchool();
  const button = (
    <button
      type="button"
      aria-label="Escola ativa"
      className="flex size-9 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 dark:bg-zinc-900 dark:border dark:border-white/10"
    >
      <MindSchoolLogo size={24} />
    </button>
  );
  return (
    <SwitcherShell side="right">
      {({ asTrigger }) => (
        <Tooltip>
          <TooltipTrigger asChild>{asTrigger ? <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger> : button}</TooltipTrigger>
          <TooltipContent side="right">{current?.schoolName ?? "Escola"}</TooltipContent>
        </Tooltip>
      )}
    </SwitcherShell>
  );
}

export function SidebarCompanyInfo() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { current, hasMultiple } = useSchool();

  const button = (
    <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
      <div className="flex items-center justify-center rounded-lg p-1 aspect-square size-8 shrink-0 bg-sidebar-accent/60 dark:bg-sidebar-accent">
        <MindSchoolLogo size={24} />
      </div>
      <div className="grid flex-1 text-sm leading-tight text-left">
        <span className="font-semibold truncate">{current?.schoolName || user?.company?.name || "MindSchool"}</span>
        <span className="text-xs truncate text-muted-foreground">
          {current ? (ROLE_LABELS[pickPrimaryRole(current.roles) ?? "GUARDIAN"] ?? "") : "Unidade Escolar"}
        </span>
      </div>
      {hasMultiple && <Icon name="ChevronsUpDown" className="ml-auto size-4 shrink-0 text-muted-foreground" />}
    </SidebarMenuButton>
  );

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <SwitcherShell side={isMobile ? "bottom" : "right"}>
          {({ asTrigger }) => (asTrigger ? <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger> : button)}
        </SwitcherShell>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
