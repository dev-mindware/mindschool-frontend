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
  useSidebar,
} from "@/components";
import { useNavigation } from "@/hooks/common/use-navigation";
import { GroupedNav } from "./grouped-nav";
import { ModularSidebar } from "./modular-sidebar";

/**
 * A sidebar lateral aplica-se apenas a ecrãs desktop (`!isMobile`); em mobile a navegação vive na `MobileModuleNavbar`
 * e o menu de escola/conta vive no `MobileHeaderMenu`.
 */
export function AppSidebar() {
  const { isMobile } = useSidebar();
  const { ready, items, model, active, pathname } = useNavigation();

  if (isMobile) return null;
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
