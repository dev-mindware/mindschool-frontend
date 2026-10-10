"use client";

import { useEffect } from "react";
import { RequestError } from "@/components/common/request-error";

/** Erro inesperado numa página autenticada: a barra lateral mantém-se e o utilizador pode tentar de novo. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 md:p-6">
      <RequestError refetch={reset} message="Ocorreu um erro inesperado ao mostrar esta página." />
    </div>
  );
}
