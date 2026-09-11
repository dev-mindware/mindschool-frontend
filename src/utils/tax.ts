import type { Tax } from "@/types";

export function sortTaxesNewestFirst(taxes: Tax[]): Tax[] {
  return [...taxes].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

export function createTaxOptions(taxes: Tax[]) {
  return sortTaxesNewestFirst(taxes).map((tax) => ({
    label: `${tax.name} (${tax.rate}%)`,
    value: tax.id,
    description: tax.description,
  }));
}
