import { applyApiFieldErrors, extractApiFieldErrors } from "../api-error";

describe("api-error field mapping", () => {
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
});

