"use client";

import { useEffect } from "react";
import { RequestError } from "@/components/common/request-error";

/** Rede de segurança para as rotas fora da área autenticada (login, faturação, ...). */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-6">
      <RequestError refetch={reset} message="Ocorreu um erro inesperado." />
    </div>
  );
}
