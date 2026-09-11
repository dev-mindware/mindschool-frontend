"use client";
import { useAuth } from "@/hooks/auth";
import { FeatureGate } from "@/components/common";
import { ProfileForm } from "./profile/profile-form";
import { CompanyForm } from "./profile/company-form";
import { CompanyLogoForm } from "./profile/company-logo-form";
import { DocumentBrandingForm } from "./profile/document-branding-form";
import { ProfileBarcodeForm } from "./profile/profile-barcode-form";

export function Profile() {
  const { user } = useAuth();
  const canManageBarcode =
    user?.role === "OWNER" || user?.role === "MANAGER";

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
          <p className="text-muted-foreground mt-1">
            Gerir as suas informações pessoais e os dados da empresa.
          </p>
        </div>
      </div>

      <ProfileForm user={user} />

      {canManageBarcode && user && (
        <FeatureGate minPlan="Smart" fallback="hidden">
          <ProfileBarcodeForm user={user} />
        </FeatureGate>
      )}

      <div data-tour="setup-company-profile">
        <CompanyForm user={user!} />
      </div>

      <CompanyLogoForm user={user} />

      <DocumentBrandingForm />
    </div>
  );
}

