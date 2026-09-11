"use client";

import { useAuthStore } from "@/stores";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EXCLUDED_PATHS = ["/auth", "/login", "/register", "/billing"];

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticating } = useAuthStore();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isAuthenticating) return;

    if (!user) {
      setIsVerified(true);
      return;
    }

    const isExcluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));
    if (isExcluded) {
      setIsVerified(true);
      return;
    }

    setIsVerified(true);
  }, [user, isAuthenticating, pathname, router]);

  if (!isVerified && user) {
    // Note: Can return a centered spinner or <Loader /> here if desired.
    return null; 
  }

  return <>{children}</>;
}
