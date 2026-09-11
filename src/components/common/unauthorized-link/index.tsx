"use client";
import { Button } from "@/components/ui";
import { Role } from "@/types";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import { getRouteByRole } from "@/utils";
import { useLogout } from "@/hooks/auth";

export function UnauthorizedLink() {
  const { user } = useAuthStore();
  const { handleLogout } = useLogout();

  return (
    <div>
      <div className="flex justify-center items-center space-x-4">
        <Link
          href={`${getRouteByRole(user?.role as Role)}`}
          className="w-max mt-6 px-4 py-2 bg-primary text-white  font-medium rounded-md shadow-md hover:bg-primary transition-all"
        >
          Voltar à página anterior
        </Link>

        <Button
          className="w-max mt-6 px-4 py-2 bg-primary text-white  font-medium rounded-md shadow-md hover:bg-primary transition-all"
          onClick={handleLogout}
        >
          Sair
        </Button>
      </div>
    </div>
  );
}
