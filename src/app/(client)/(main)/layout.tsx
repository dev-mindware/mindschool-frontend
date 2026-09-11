import { AppSidebar, BreadcrumbProvider, SidebarInset, PlanGate } from "@/components";
import { TrialBanner } from "@/components/shared";
import { NotificationDetail } from "@/components/shared/notifications";
import { RouteProtector } from "@/contexts";
import { FeatureGateProvider, StoreProvider } from "@/providers";

type Props = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: Props) {
  return (
    <RouteProtector allowed={["OWNER", "MANAGER"]} checkPlan={false}>
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
