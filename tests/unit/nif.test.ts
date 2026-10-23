import { isValidNif, nifError, normalizeNif } from "../../src/lib/nif";

describe("NIF", () => {
  it("aceita os dois formatos angolanos, com espaços e minúsculas", () => {
    expect(isValidNif("5417012345")).toBe(true);
    expect(isValidNif("004567890LA041")).toBe(true);
    expect(isValidNif(" 004567890la041 ")).toBe(true);
    expect(normalizeNif(" 004567890la041 ")).toBe("004567890LA041");
  });

  it("recusa tamanhos e formas inválidos", () => {
    for (const v of ["", "12345", "54170123456", "004567890L041", "ABCDEFGHIJ", "004567890LA04"]) expect(isValidNif(v)).toBe(false);
  });

  it("o campo é opcional: vazio não dá erro, valor inválido dá", () => {
    expect(nifError("")).toBeUndefined();
    expect(nifError(undefined)).toBeUndefined();
    expect(nifError("5417012345")).toBeUndefined();
    expect(nifError("123")).toMatch(/NIF inválido/);
  });
});
