"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Icon, Input } from "@/components";
import { toast } from "sonner";
import {
  FINAL_CONSUMER_TAX_NUMBER,
  isValidAngolanTaxNumber,
  normalizeTaxNumber,
  TAXPAYER_STATUS_LABELS,
  VAT_REGIME_LABELS,
} from "@/lib/contributor";
import { ContributorVerificationError } from "@/services/contributor-service";
import { useContributorVerification } from "@/hooks/contributors/use-contributor-verification";
import type {
  ContributorVerificationStatus,
  VerifiedContributor,
} from "@/types/contributor";
import { cn } from "@/lib/utils";

interface NifVerificationFieldProps {
  value: string;
  onChange: (value: string) => void;
  onVerified: (contributor: VerifiedContributor) => void;
  onStatusChange?: (status: ContributorVerificationStatus) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  verificationEnabled?: boolean;
  allowProceedWithoutVerification?: boolean;
  proceedWarningMessage?: string;
}

export function NifVerificationField({
  value,
  onChange,
  onVerified,
  onStatusChange,
  label = "NIF",
  placeholder = "Introduza o NIF",
  error,
  disabled,
  className,
  name,
  verificationEnabled = true,
  allowProceedWithoutVerification = false,
  proceedWarningMessage,
}: NifVerificationFieldProps) {
  const [status, setStatus] = useState<ContributorVerificationStatus>("idle");
  const [contributor, setContributor] = useState<VerifiedContributor | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const requestSequence = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const onVerifiedRef = useRef(onVerified);
  const onStatusChangeRef = useRef(onStatusChange);
  const { mutateAsync: verifyContributor } = useContributorVerification();

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const updateStatus = useCallback(
    (nextStatus: ContributorVerificationStatus) => {
      setStatus(nextStatus);
      onStatusChangeRef.current?.(nextStatus);
    },
    [],
  );

  const cancelVerification = useCallback(() => {
    requestSequence.current += 1;
    controller.current?.abort();
    controller.current = null;
    setMessage(null);
    updateStatus("idle");
  }, [updateStatus]);

  const verify = useCallback(async () => {
    const normalized = normalizeTaxNumber(value);
    if (
      !verificationEnabled ||
      normalized === FINAL_CONSUMER_TAX_NUMBER ||
      !isValidAngolanTaxNumber(normalized)
    ) {
      return;
    }

    controller.current?.abort();
    const currentController = new AbortController();
    controller.current = currentController;
    const sequence = ++requestSequence.current;

    setContributor(null);
    setMessage(null);
    updateStatus("checking");

    try {
      const result = await verifyContributor({
        taxNumber: normalized,
        signal: currentController.signal,
      });
      if (sequence !== requestSequence.current) return;

      setContributor(result);
      updateStatus(result.hasRestrictions ? "restricted" : "verified");
      onVerifiedRef.current(result);
    } catch (error) {
      if (currentController.signal.aborted || sequence !== requestSequence.current) return;

      if (
        error instanceof ContributorVerificationError &&
        error.code === "TAXPAYER_NOT_FOUND"
      ) {
        setMessage(error.message);
        updateStatus("not_found");
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível verificar o NIF neste momento.";

      setMessage(errorMessage);
      toast.warning(errorMessage);
      updateStatus("unavailable");
    }
  }, [updateStatus, value, verificationEnabled, verifyContributor]);

  useEffect(() => {
    const normalized = normalizeTaxNumber(value);
    requestSequence.current += 1;
    controller.current?.abort();
    setContributor(null);
    setMessage(null);

    if (
      !verificationEnabled ||
      !normalized ||
      normalized === FINAL_CONSUMER_TAX_NUMBER ||
      !isValidAngolanTaxNumber(normalized)
    ) {
      updateStatus("idle");
      return;
    }

    updateStatus("checking");
    const timer = window.setTimeout(() => void verify(), 500);
    return () => window.clearTimeout(timer);
  }, [value, verificationEnabled, verify, updateStatus]);

  useEffect(() => () => controller.current?.abort(), []);

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        name={name}
        label={label}
        startIcon="IdCard"
        value={value}
        onChange={(event) => onChange(normalizeTaxNumber(event.target.value))}
        placeholder={placeholder}
        maxLength={14}
        autoCapitalize="characters"
        spellCheck={false}
        disabled={disabled}
        error={error}
      />

      {status === "checking" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground" role="status">
          <Icon name="LoaderCircle" className="h-3.5 w-3.5 animate-spin" />
          <span>A verificar o NIF na SETIC-FP...</span>
          <button
            type="button"
            onClick={cancelVerification}
            className="inline-flex items-center justify-center rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cancelar validação do NIF"
            title="Cancelar validação"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </div>
      )}

      {(status === "verified" || status === "restricted") && contributor && (
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-xs",
            status === "restricted"
              ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
              : "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
          )}
        >
          <p className="flex items-center gap-2 font-medium">
            <Icon
              name={status === "restricted" ? "TriangleAlert" : "CircleCheck"}
              className="h-3.5 w-3.5"
            />
            {status === "restricted"
              ? `Contribuinte ${TAXPAYER_STATUS_LABELS[contributor.status].toLowerCase()}. A operação pode continuar.`
              : "NIF confirmado com sucesso."}
          </p>
          <p className="mt-1 opacity-80">
            {TAXPAYER_STATUS_LABELS[contributor.status]} · {VAT_REGIME_LABELS[contributor.vatRegime]}
            {contributor.nonResident ? " · Não residente" : ""}
          </p>
        </div>
      )}

      {status === "not_found" && (
        <div className="space-y-2" role="alert">
          <p className="flex items-center gap-2 text-xs text-destructive">
            <Icon name="CircleX" className="h-3.5 w-3.5" />
            {message}
          </p>
          {allowProceedWithoutVerification && proceedWarningMessage && (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {proceedWarningMessage}
            </p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => void verify()}>
            Repetir
          </Button>
        </div>
      )}

      {status === "unavailable" && (
        <div className="space-y-2" role="alert">
          {allowProceedWithoutVerification && proceedWarningMessage && (
            <p className="flex max-w-full items-start gap-2 whitespace-normal break-words text-xs leading-relaxed text-amber-700 dark:text-amber-300">
              <Icon name="TriangleAlert" className="h-3.5 w-3.5" />
              <span className="min-w-0 flex-1">{proceedWarningMessage}</span>
            </p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => void verify()}>
            Repetir
          </Button>
        </div>
      )}

    </div>
  );
}
