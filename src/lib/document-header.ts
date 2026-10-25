import type { SchoolInstitutionalProfile } from "@/types/school-settings";

type Profile = Pick<SchoolInstitutionalProfile, "province" | "municipality" | "taxNumber" | "medRegistrationCode" | "decreeNumber">;

const join = (parts: Array<string | false | undefined | null>) => parts.filter(Boolean).join(" • ");

/** Linha do governo no cabeçalho oficial: só com os dados que a escola tem (nunca uma província inventada). */
export function governmentLine(p: Profile, municipalOffice: string): string {
  return join([
    p.province ? `GOVERNO PROVINCIAL DE ${p.province.toUpperCase()}` : "GOVERNO PROVINCIAL",
    p.municipality && `${municipalOffice} ${p.municipality.toUpperCase()}`,
  ]);
}

/** NIF, registo MED e decreto da escola; os que não existem ficam de fora. */
export function registrationLine(p: Profile, opts: { nif?: boolean } = {}): string {
  return join([
    opts.nif && p.taxNumber && `NIF: ${p.taxNumber}`,
    p.medRegistrationCode && `Registo MED: ${p.medRegistrationCode}`,
    p.decreeNumber,
  ]);
}
