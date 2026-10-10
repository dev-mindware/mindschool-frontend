import { AppSidebar, BreadcrumbProvider, SidebarInset, PlanGate } from "@/components";
import { TrialBanner } from "@/components/shared";
import { NotificationDetail } from "@/components/shared/notifications";
import { RouteProtector } from "@/contexts";
import { FeatureGateProvider, StoreProvider } from "@/providers";
import { STAFF_ROLES } from "@/constants/roles";
import { Role } from "@/types";

type Props = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: Props) {
  return (
    <RouteProtector allowed={[...STAFF_ROLES, "GUARDIAN", "STUDENT"] as Role[]} checkPlan={false}>
      <StoreProvider>
        <FeatureGateProvider>
          <AppSidebar />
          <SidebarInset>
            <TrialBanner />
            <BreadcrumbProvider>
              <PlanGate>{children}</PlanGate>
            </BreadcrumbProvider>
          </SidebarInset>
          <NotificationDetail />
        </FeatureGateProvider>
      </StoreProvider>
    </RouteProtector>
  );
}
