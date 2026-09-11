import { PageWrapper } from "@/components";
import { ReservationManagementContent } from "@/components/client/management";

export default function ReservationPage() {
  return (
    <PageWrapper subRoute="Gestão de Reservas" onboardingTourId="reservations">
      <ReservationManagementContent />
    </PageWrapper>
  );
}
