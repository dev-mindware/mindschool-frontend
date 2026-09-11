"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "@/types";
import { Loader } from "./loader";
import { useAccessControl } from "@/providers";

interface RouteProtectorProps {
  allowed: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  checkPlan?: boolean;
}

export function RouteProtector({
  allowed,
  children,
  fallback,
  checkPlan = true,
}: RouteProtectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const access = useAccessControl(allowed, checkPlan);

  useEffect(() => {
    switch (access.status) {
      case "unauthenticated":
        // ✅ FIX: só redireciona se ainda não estiver na página de login
        if (pathname !== "/auth/login") {
          router.replace("/auth/login");
        }
        break;
      case "unauthorized":
        if (pathname !== "/unauthorized") {
          router.replace("/unauthorized");
        }
        break;
      case "plan_insufficient":
        if (pathname !== access.redirectTo) {
          router.replace(access.redirectTo);
        }
        break;
    }
  }, [access, pathname, router]);

  if (access.status !== "allowed") {
    return <>{fallback || <Loader />}</>;
  }

  return <>{children}</>;
}