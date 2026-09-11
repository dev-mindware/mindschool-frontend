import type { SeticContributor } from "./setic.types";
import type { VerifiedContributor, TaxpayerStatus, VatRegime, TaxpayerType } from "@/types/contributor";
import { taxpayerHasRestrictions } from "@/lib/contributor";

function parseNonResidentIndicator(value: SeticContributor["indicadorNaoResidente"]): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (normalized === "V" || normalized === "T" || normalized === "TRUE" || normalized === "1") {
      return true;
    }
    if (normalized === "F" || normalized === "FALSE" || normalized === "0" || normalized === "") {
      return false;
    }
  }
  return Boolean(value);
}

export function mapSeticToVerifiedContributor(
  contributor: SeticContributor
): VerifiedContributor {
  const status = (contributor.estadoContribuinte || "A") as TaxpayerStatus;
  return {
    taxNumber: contributor.numeroNIF,
    name: (contributor.nome || "").trim(),
    taxpayerType: (contributor.tipoContribuinte || "SINGULAR") as TaxpayerType,
    status,
    vatRegime: (contributor.regimeIva || "GNAD") as VatRegime,
    nonResident: parseNonResidentIndicator(contributor.indicadorNaoResidente),
    hasRestrictions: taxpayerHasRestrictions(status),
  };
}
