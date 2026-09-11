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
  Icon,
} from "@/components";
import { menuItems } from "@/constants/menu-items";
import { useAuth } from "@/hooks/auth";
import { getSidebarForUser } from "@/lib/get-sidebar-for-user";
import { PlanType } from "@/types";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return <SidebarSkeleton />;

  const plan = user?.company?.subscription
    ? (user.company?.subscription?.plan?.name as PlanType)
    : undefined;

  const isPosRoute = pathname.startsWith("/pos");

  let baseMenuItems = [...menuItems.items];

  if (isPosRoute) {
    // Show only POS menu items
    baseMenuItems = baseMenuItems.filter((item) => item.url.startsWith("/pos"));

    // Add "Voltar ao Dashboard" link for OWNER and MANAGER
    if (user.role === "OWNER" || user.role === "MANAGER") {
      baseMenuItems.push({
        name: "Voltar ao Dashboard",
        url: "/dashboard",
        icon: <Icon name="ArrowLeft" className="w-5 h-5" />,
        roles: ["OWNER", "MANAGER"],
        minPlan: "Smart",
      });
    }
  } else {
    // Show all except POS menu items
    baseMenuItems = baseMenuItems.filter((item) => !item.url.startsWith("/pos"));

    // Add "Acessar POS" link for OWNER and MANAGER
    if (user.role === "OWNER" || user.role === "MANAGER") {
      baseMenuItems.push({
        name: "Acessar POS",
        url: "/pos/settings",
        icon: <Icon name="Computer" className="w-5 h-5" />,
        roles: ["OWNER", "MANAGER"],
        minPlan: "Smart",
      });
    }
  }

  const filteredMenu = getSidebarForUser(baseMenuItems, user.role, user.company?.subscription, plan);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarCompanyInfo />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:items-center mt-4">
        <NavMenu items={filteredMenu} />
      </SidebarContent>
      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
