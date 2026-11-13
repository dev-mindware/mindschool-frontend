import {
  CODE_HINTS,
  applyApiFieldErrors,
  extractApiFieldErrors,
  getApiErrorMessage,
  isTransientRetryableError,
} from "../api-error";

const FORBIDDEN_AO90_OR_TECH = [
  /\b(direção|exceção|exceções|fatura|faturas|faturação|letivo|letivos|ação|ações|atualizar|atualize|selecione|ativo|ativa|ativos|ativas|desativada)\b/i,
  /\b(request_id|digest|totp_code|webauthn|Prisma|Axios|ECONN|Request failed)\b/i,
  /\b(POST|GET|PUT|DELETE)\s+\//,
];

describe("api-error field mapping e tradução humana PT-AO45", () => {
  it("extrai erros por campo em snake_case e camelCase com rótulos legíveis", () => {
    const err = {
      response: {
        data: {
          errors: [
            { field: "full_name", message: "Minimo de 3 caracteres." },
            { field: "birth_date", message: "Data de nascimento: inválida" },
          ],
        },
      },
    };

    const map = extractApiFieldErrors(err);
    expect(map.full_name).toBe("Nome: Minimo de 3 caracteres.");
    expect(map.fullName).toBe("Nome: Minimo de 3 caracteres.");
    expect(map.birth_date).toBe("Data de nascimento: inválida");
    expect(map.birthDate).toBe("Data de nascimento: inválida");
  });

  it("ignora campo genérico 'formulario' ou '(corpo)' ao extrair erros de campo", () => {
    const err = {
      response: {
        data: {
          errors: [{ field: "formulario", message: "Verifique os dados enviados." }],
        },
      },
    };
    expect(extractApiFieldErrors(err)).toEqual({});
    expect(getApiErrorMessage(err, "Fallback")).toBe("Verifique os dados enviados.");
  });

  it("aplica erros mapeados no setError do react-hook-form", () => {
    const err = {
      response: {
        data: {
          errors: [{ field: "document_number", message: "BI inválido." }],
        },
      },
    };
    const setError = jest.fn();
    const applied = applyApiFieldErrors(err, setError, { document_number: "idDocumentNumber" });

    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledWith("idDocumentNumber", { type: "server", message: "Documento: BI inválido." });
  });

  it("cobre todos os 51 códigos da API em PT-AO45 sem jargão técnico ou referências", () => {
    const keys = Object.keys(CODE_HINTS);
    expect(keys.length).toBeGreaterThanOrEqual(51);

    for (const [code, text] of Object.entries(CODE_HINTS)) {
      if (text.length <= 15) throw new Error(`Hint curto demais para ${code}`);
      expect(text.length).toBeGreaterThan(15);
      for (const re of FORBIDDEN_AO90_OR_TECH) {
        if (re.test(text)) throw new Error(`AO90/jargão detectado em ${code}: ${text}`);
        expect(text).not.toMatch(re);
      }
    }
  });

  it("traduz falhas de rede, timeout, cancelamento e gateway 5xx sem vazar inglês", () => {
    expect(
      getApiErrorMessage({ code: "ERR_NETWORK", message: "Network Error" }, "Fallback"),
    ).toContain("ligação à Internet");

    expect(
      getApiErrorMessage({ code: "ECONNABORTED", message: "timeout of 30000ms exceeded" }, "Fallback"),
    ).toContain("demorou demasiado tempo");

    expect(
      getApiErrorMessage({ code: "ERR_CANCELED", message: "canceled" }, "Fallback"),
    ).toContain("cancelado");

    expect(
      getApiErrorMessage(
        { message: "Request failed with status code 502", response: { status: 502, data: "<html>502 Bad Gateway</html>" } },
        "Fallback",
      ),
    ).not.toMatch(/Request failed|502/);
  });

  it("formata tempo de espera em RATE_LIMITED e ACCOUNT_LOCKED e oculta jargão interno", () => {
    expect(
      getApiErrorMessage({ response: { status: 423, data: { code: "ACCOUNT_LOCKED", retry_after_seconds: 180 } } }, "Fallback"),
    ).toContain("3 minutos");

    expect(
      getApiErrorMessage({ response: { status: 429, data: { code: "RATE_LIMITED", retry_after: 45 } } }, "Fallback"),
    ).toContain("45 segundos");

    expect(
      getApiErrorMessage(new Error("PrismaClientKnownRequestError P2002"), "Não foi possível guardar."),
    ).toBe("Não foi possível guardar.");

    expect(
      getApiErrorMessage(
        { response: { status: 403, data: { code: "MFA_ENROLLMENT_REQUIRED", detail: "POST /auth/mfa/enroll required" } } },
        "Fallback",
      ),
    ).not.toContain("POST /auth");
  });

  it("mantém detalhe específico limpo para conflitos de domínio (ex.: campo duplicado)", () => {
    expect(
      getApiErrorMessage(
        {
          response: {
            status: 409,
            data: { code: "CONFLICT", detail: "Já existe um registo com este endereço de e-mail." },
          },
        },
        "Fallback",
      ),
    ).toBe("Já existe um registo com este endereço de e-mail.");
  });

  it("só considera erros transitórios (rede / 502-504) para retry no React Query", () => {
    expect(isTransientRetryableError({ code: "ERR_NETWORK" })).toBe(true);
    expect(isTransientRetryableError({ response: { status: 503 } })).toBe(true);
    expect(isTransientRetryableError({ response: { status: 403 } })).toBe(false);
    expect(isTransientRetryableError({ response: { status: 422 } })).toBe(false);
    expect(isTransientRetryableError({ code: "ERR_CANCELED" })).toBe(false);
  });
});
