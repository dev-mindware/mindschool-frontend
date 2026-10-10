"use client";
import {
  NavMenu,
  UserInfo,
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSkeleton,
  SidebarCompanyInfo,
} from "@/components";
import { useNavigation } from "@/hooks/common/use-navigation";
import { GroupedNav } from "./grouped-nav";
import { ModularSidebar } from "./modular-sidebar";

/**
 * A sidebar adapta-se ao papel: `dual` (rail de módulos + painel) quando há muitos módulos e páginas,
 * `grouped` (coluna com rótulos) para listas planas e `flat` (acordeões) para o resto. Ver `constants/navigation.ts`.
 */
export function AppSidebar() {
  const { ready, items, model, active, pathname } = useNavigation();

  if (!ready) return <SidebarSkeleton />;
  if (model.mode === "dual") return <ModularSidebar model={model} active={active} pathname={pathname} />;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarCompanyInfo />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:items-center mt-4">
        {model.mode === "grouped" ? <GroupedNav model={model} pathname={pathname} /> : <NavMenu items={items} />}
      </SidebarContent>
      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
