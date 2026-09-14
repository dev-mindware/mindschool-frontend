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
import { useAuth } from "@/hooks/auth";
import { useMultiSchoolStore } from "@/stores/school/multi-school-store";

export function SidebarCompanyInfo() {
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const { units, selectedUnitId, selectUnit } = useMultiSchoolStore();

  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground aspect-square size-8">
                <Icon name="GraduationCap" className="size-4" />
              </div>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">
                  {currentUnit?.name || user?.company?.name || "MindSchool"}
                </span>
                <span className="text-xs truncate text-muted-foreground">
                  {currentUnit ? `${currentUnit.municipality} • ${currentUnit.code}` : "Unidade Escolar"}
                </span>
              </div>
              <Icon name="ChevronsUpDown" className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Campus & Unidades Escolares
            </DropdownMenuLabel>

            {units.map((unit) => (
              <DropdownMenuItem
                key={unit.id}
                onClick={() => selectUnit(unit.id)}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex items-center justify-center border rounded-md size-6">
                  <Icon name="School" className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{unit.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {unit.municipality} ({unit.totalStudents} alunos)
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
