import { sortByName } from "@/lib/sort-names";

describe("sortByName", () => {
  it("põe os nomes acentuados na sua posição alfabética", () => {
    const rows = [{ n: "TESTE Novo Ingresso" }, { n: "TESTE Ângela" }, { n: "Zé" }, { n: "Ana" }];
    expect(sortByName(rows, (r) => r.n).map((r) => r.n)).toEqual(["Ana", "TESTE Ângela", "TESTE Novo Ingresso", "Zé"]);
  });
});
