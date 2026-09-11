"use client";

import { useMutation } from "@tanstack/react-query";
import { contributorService } from "@/services/contributor-service";

export function useContributorVerification() {
  return useMutation({
    mutationKey: ["contributor-verification"],
    retry: false,
    mutationFn: ({
      taxNumber,
      signal,
    }: {
      taxNumber: string;
      signal?: AbortSignal;
    }) => contributorService.verify(taxNumber, signal),
  });
}
