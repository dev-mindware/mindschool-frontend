import { excelSheetName } from "@/utils/excel-import";

describe("excelSheetName", () => {
  it("corta nomes com mais de 31 caracteres (o modelo de alunos falhava)", () => {
    expect(excelSheetName("Modelo Alunos e Encarregados de Educação")).toHaveLength(31);
  });
  it("tira os caracteres que o Excel recusa", () => {
    expect(excelSheetName("Notas/Provas: [1]")).toBe("Notas Provas 1");
  });
  it("usa um nome por omissão quando vem vazio", () => {
    expect(excelSheetName("")).toBe("Folha 1");
    expect(excelSheetName(undefined)).toBe("Folha 1");
  });
});
