export type TaxpayerDocumentType = "NIF";

export type TaxpayerStatus = "A" | "C" | "D" | "E" | "F" | "G";

export type VatRegime = "GNAD" | "TRAG" | "SIMP" | "NBND" | "EXCL";

export type TaxpayerType = "SINGULAR" | "COLLECTIVE";

export interface VerifiedContributor {
  taxNumber: string;
  name: string;
  taxpayerType: TaxpayerType;
  status: TaxpayerStatus;
  vatRegime: VatRegime;
  nonResident: boolean;
  hasRestrictions: boolean;
}

export type ContributorVerificationStatus =
  | "idle"
  | "checking"
  | "verified"
  | "restricted"
  | "not_found"
  | "unavailable";

export type ContributorErrorCode =
  | "INVALID_TAX_NUMBER"
  | "TAXPAYER_NOT_FOUND"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UPSTREAM_TIMEOUT";

export interface ContributorErrorResponse {
  message: string;
  code: ContributorErrorCode;
}
