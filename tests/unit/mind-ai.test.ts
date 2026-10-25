import { mindSchoolContext, suggestionChipsFor } from "@/constants/mind-ai";

describe("assistente MIND no MindSchool", () => {
  it("manda o produto, a escola ativa e o papel", () => {
    expect(mindSchoolContext({ role: "TEACHER", company: { id: "s1", name: "Colégio Esperança" } })).toEqual({
      product: "mindschool", schoolId: "s1", schoolName: "Colégio Esperança", role: "TEACHER",
    });
  });
  it("as sugestões dependem do papel, com um conjunto por omissão", () => {
    expect(suggestionChipsFor("GUARDIAN")).toContain("Propinas");
    expect(suggestionChipsFor("TEACHER")).toContain("Lançar notas");
    expect(suggestionChipsFor("FINANCIAL")).not.toContain("Pautas");
    expect(suggestionChipsFor(undefined)).toEqual(suggestionChipsFor("QUALQUER"));
  });
});
