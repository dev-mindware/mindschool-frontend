const collator = new Intl.Collator("pt", { sensitivity: "base" });

/** Ordem alfabética portuguesa por nome: «Ângela» vem antes de «Novo» (a ordem do SQL põe os acentuados no fim). */
export function sortByName<T>(items: T[], name: (item: T) => string): T[] {
  return [...items].sort((a, b) => collator.compare(name(a), name(b)));
}
