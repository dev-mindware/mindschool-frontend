import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationDetail } from "@/components/shared/notifications";

export const metadata: Metadata = {
  title: "Acesso Não Autorizado · MindSchool",
  description: "Não possui permissão para aceder a esta página.",
};

export default function UnauthorizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full">
      <Suspense fallback={null}>
        {children}
      </Suspense>
      <NotificationDetail />
    </main>
  );
}
