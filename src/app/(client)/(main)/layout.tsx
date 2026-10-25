import { AppSidebar, BreadcrumbProvider, SidebarInset, PlanGate, StepUpDialog, ImpersonationBanner, PlanUpgradeModal } from "@/components";
import { TrialBanner } from "@/components/shared";
import { NotificationDetail } from "@/components/shared/notifications";
import { RouteProtector } from "@/contexts";
import { FeatureGateProvider, SchoolProvider } from "@/providers";
import { STAFF_ROLES } from "@/constants/roles";
import { Role } from "@/types";
import { ScrollToTop } from "@/components/common/scroll-to-top";

type Props = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: Props) {
  return (
    <RouteProtector allowed={[...STAFF_ROLES, "GUARDIAN", "STUDENT"] as Role[]} checkPlan={false}>
      <SchoolProvider>
        <FeatureGateProvider>
          <AppSidebar />
          <SidebarInset>
            <ScrollToTop />
            <ImpersonationBanner />
            <TrialBanner />
            <BreadcrumbProvider>
              <PlanGate>{children}</PlanGate>
            </BreadcrumbProvider>
          </SidebarInset>
          <NotificationDetail />
          <StepUpDialog />
          <PlanUpgradeModal />
        </FeatureGateProvider>
      </SchoolProvider>
    </RouteProtector>
  );
}
