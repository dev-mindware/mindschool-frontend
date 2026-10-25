import { getApiErrorMessage } from "../../src/utils/api-error";
import { GLOSSARY } from "../../src/constants/glossary";

const apiError = (code: string, detail: string, errors?: Array<{ message: string }>) => ({ response: { data: { code, detail, ...(errors ? { errors } : {}) } } });

describe("getApiErrorMessage", () => {
  it("traduz códigos conhecidos para uma frase com o que fazer", () => {
    const msg = getApiErrorMessage(apiError("CANCELLATION_DEADLINE_PASSED", "Prazo de anulacao ultrapassado"), "Erro");
    expect(msg).toMatch(/Direção/);
    expect(msg).toContain("Prazo de anulacao ultrapassado"); // junta o detalhe da API quando é curto
  });

  it("mantém o erro de campo de validação (mais específico que o código)", () => {
    expect(getApiErrorMessage(apiError("VALIDATION_ERROR", "Pedido invalido", [{ message: "Email inválido" }]), "Erro")).toBe("Email inválido");
  });

  it("sem código conhecido devolve o detalhe, e sem nada o fallback", () => {
    expect(getApiErrorMessage(apiError("OUTRO", "Algo específico"), "Erro")).toBe("Algo específico");
    expect(getApiErrorMessage({}, "Falhou")).toBe("Falhou");
  });
});

describe("glossário", () => {
  it("cada termo tem título e texto, e nenhum fixa valores que a escola define", () => {
    const incomplete = Object.entries(GLOSSARY).filter(([, e]) => e.title.length <= 2 || e.text.length <= 20).map(([k]) => k);
    expect(incomplete).toEqual([]);
    expect(GLOSSARY.mt.text).not.toMatch(/\b\d+(?:,\d+)?\s*valores\b/);
  });
});

describe("erros de campo com o nome do campo", () => {
  const err = (field: string, message: string) => ({ response: { data: { code: "VALIDATION_ERROR", detail: "Pedido invalido", errors: [{ field, message }] } } });
  it("diz que campo falhou", () => {
    expect(getApiErrorMessage(err("document_number", "Minimo de 4 caracteres."), "Erro")).toBe("Documento: Minimo de 4 caracteres.");
    expect(getApiErrorMessage(err("generate.breaks.0.after", "Intervalo invalido"), "Erro")).toBe("Intervalo invalido");
  });
  it("não repete o nome quando a mensagem já o traz", () => {
    expect(getApiErrorMessage(err("nif", "NIF inválido."), "Erro")).toBe("NIF inválido.");
  });
});
