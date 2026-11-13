"use client";

import { Icon } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import { getApiErrorMessage, isNetworkOrOfflineError } from "@/utils/api-error";
import Image from "next/image";

type Props = {
  refetch: () => void;
  message?: string;
  error?: unknown;
  hint?: string;
};

export function RequestError({ refetch, message, error, hint }: Props) {
  const defaultMsg = "Não foi possível carregar os dados neste momento.";
  const resolvedMessage = error
    ? getApiErrorMessage(error, message ?? defaultMsg)
    : (message ?? defaultMsg);

  const isOffline = error ? isNetworkOrOfflineError(error) : false;
  const resolvedHint =
    hint ??
    (isOffline
      ? "Verifique se o computador ou telemóvel tem ligação à Internet antes de tentar novamente."
      : "Tente novamente dentro de instantes. Se o problema continuar, contacte a secretaria ou o apoio técnico.");

  return (
    <Card className="p-8 mt-4">
      <CardContent className="space-y-5 flex flex-col items-center justify-center text-center">
        <Image
          src="/error-req.svg"
          alt="Não foi possível carregar os dados"
          width={250}
          height={250}
          priority
        />
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-semibold text-foreground">
            {resolvedMessage}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {resolvedHint}
          </p>
        </div>
        <Button
          className="bg-background w-max px-4 transition-colors text-foreground"
          onClick={() => refetch()}
        >
          <Icon name="RefreshCcw" size={20} />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}
