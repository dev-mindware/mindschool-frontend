import { HeroImageSide, ResetPassword } from "@/components";

export default function ResetPassPage() {
  return (
    <div className="grid min-h-screen min-h-dvh w-full overflow-hidden lg:grid-cols-2">
      <div className="hidden lg:block">
        <HeroImageSide source="/ForgotPassword.svg" />
      </div>

      <div className="flex min-h-[100svh] items-center justify-center bg-background p-5 md:p-8 lg:min-h-0">
        <div className="w-full max-w-sm">
          <ResetPassword />
        </div>
      </div>
    </div>
  );
}
