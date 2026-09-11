import type {
  ContributorErrorResponse,
  VerifiedContributor,
} from "@/types/contributor";

export class ContributorVerificationError extends Error {
  constructor(
    public readonly code: ContributorErrorResponse["code"],
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ContributorVerificationError";
  }
}

export const contributorService = {
  verify: async (taxNumber: string, signal?: AbortSignal) => {
    const response = await fetch("/api/contributors/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taxNumber }),
      cache: "no-store",
      signal,
    });

    const data = (await response.json()) as
      | VerifiedContributor
      | ContributorErrorResponse;

    if (!response.ok) {
      const error = data as ContributorErrorResponse;
      throw new ContributorVerificationError(
        error.code || "UPSTREAM_ERROR",
        error.message || "Não foi possível verificar o NIF.",
        response.status,
      );
    }

    return data as VerifiedContributor;
  },
};
