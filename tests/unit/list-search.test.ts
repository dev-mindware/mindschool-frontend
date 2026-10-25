import { applyListFilters } from "@/components/common/data-list";
import type { ListFiltersState } from "@/hooks/common/use-list-filters";

const filters = (search: string) => ({ search, get: () => "" }) as unknown as ListFiltersState;
const rows = [{ name: "Angelo Domingos" }, { name: "Ângela Oxóssi" }, { name: "Maria" }];
const run = (q: string) => applyListFilters(rows, filters(q), { searchText: (r) => r.name }).map((r) => r.name);

describe("pesquisa das listas", () => {
  it("ignora acentos nos dois sentidos", () => {
    expect(run("ângelo")).toEqual(["Angelo Domingos"]);
    expect(run("angela")).toEqual(["Ângela Oxóssi"]);
    expect(run("oxossi")).toEqual(["Ângela Oxóssi"]);
  });
  it("ignora maiúsculas e espaços nas pontas", () => {
    expect(run("  MARIA ")).toEqual(["Maria"]);
  });
});
