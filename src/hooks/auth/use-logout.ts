"use client";
import { useAuthStore } from "@/stores";

export function useLogout() {
  const { logout } = useAuthStore();

  return { handleLogout: logout };
}