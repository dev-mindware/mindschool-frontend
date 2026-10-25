import { isbnProblem } from "@/components/client/academic/library/new-book-modal";

describe("isbnProblem", () => {
  it("aceita vazio (campo opcional), ISBN-13 e ISBN-10 com hífenes", () => {
    expect(isbnProblem("")).toBeUndefined();
    expect(isbnProblem("978-989-23-1234-5")).toBeUndefined();
    expect(isbnProblem("0-306-40615-2")).toBeUndefined();
    expect(isbnProblem("080442957X")).toBeUndefined();
  });
  it("recusa o que não é ISBN, com mensagem em português", () => {
    expect(isbnProblem("abc")).toMatch(/10 ou 13 dígitos/);
    expect(isbnProblem("12345")).toMatch(/10 ou 13 dígitos/);
  });
});
