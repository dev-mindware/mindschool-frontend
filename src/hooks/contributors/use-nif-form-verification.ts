"use client";

import { useCallback } from "react";
import type {
  ContributorVerificationStatus,
  VerifiedContributor,
} from "@/types/contributor";

interface UseNifFormVerificationOptions {
  setValue: (name: any, value: any, options?: any) => void;
  setError: (name: any, error: { type: string; message: string }) => void;
  clearErrors: (name?: any) => void;
  taxNumberField: string;
  nameField: string;
  blockNotFound?: boolean;
}

export function useNifFormVerification({
  setValue,
  setError,
  clearErrors,
  taxNumberField,
  nameField,
  blockNotFound = true,
}: UseNifFormVerificationOptions) {
  const handleStatusChange = useCallback(
    (status: ContributorVerificationStatus) => {
      if (!blockNotFound) return;

      if (status === "checking") {
        setError(taxNumberField, {
          type: "verification",
          message: "Aguarde pela verificação do NIF.",
        });
        return;
      }

      if (status === "not_found") {
        setError(taxNumberField, {
          type: "verification",
          message: "Não foi encontrado um contribuinte com este NIF.",
        });
        return;
      }

      if (["verified", "restricted", "unavailable"].includes(status)) {
        clearErrors(taxNumberField);
      }
    },
    [blockNotFound, clearErrors, setError, taxNumberField],
  );

  const handleVerified = useCallback(
    (contributor: VerifiedContributor) => {
      setValue(nameField, contributor.name, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      if (blockNotFound) clearErrors(taxNumberField);
    },
    [blockNotFound, clearErrors, nameField, setValue, taxNumberField],
  );

  return { handleStatusChange, handleVerified };
}
