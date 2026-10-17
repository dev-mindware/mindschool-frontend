import {
  validIban,
  angolaBiSchema,
  validateIdDocumentByType,
  phoneNumberSchema,
  quantitySchema,
  currencySchema,
  percentageSchema,
  schoolGradeSchema,
} from "@/schemas/helps";

describe("Validação de IBAN Angolano (Modulo-97)", () => {
  it("valida IBAN angolano canónico correcto", () => {
    // AO06 + 21 dígitos com mod97 válido
    expect(validIban("AO06004000005660082410174")).toBe(true);
    expect(validIban("AO06.0040.0000.5660.0824.1017.4")).toBe(true);
  });

  it("rejeita IBAN mal formado ou com checksum incorrecto", () => {
    expect(validIban("AO06004000005660082410179")).toBe(false);
    expect(validIban("PT50000000000000000000000")).toBe(false);
    expect(validIban("")).toBe(false);
  });
});

describe("Validação de Bilhete de Identidade (BI Angola)", () => {
  it("aceita formato canónico de 14 caracteres (9 dígitos + 2 letras + 3 dígitos)", () => {
    const validBi = "007849302LA042";
    expect(() => angolaBiSchema.parse(validBi)).not.toThrow();
  });

  it("rejeita BIs inválidos", () => {
    expect(() => angolaBiSchema.parse("12345")).toThrow();
    expect(() => angolaBiSchema.parse("00784930212345")).toThrow(); // sem letras
    expect(() => angolaBiSchema.parse("007849302L1042")).toThrow(); // apenas 1 letra
  });

  it("validateIdDocumentByType valida consoante o tipo", () => {
    expect(validateIdDocumentByType("007849302LA042", "IDENTITY_CARD").valid).toBe(true);
    expect(validateIdDocumentByType("12345", "IDENTITY_CARD").valid).toBe(false);
    expect(validateIdDocumentByType("N1234567", "PASSPORT").valid).toBe(true);
    expect(validateIdDocumentByType("123", "PASSPORT").valid).toBe(false);
    expect(validateIdDocumentByType("12345/2020", "BIRTH_CERTIFICATE").valid).toBe(true);
  });
});

describe("Validação de Telefones de Angola", () => {
  it("aceita números com prefixos válidos (91, 92, 93, 94, 95, 97, 99)", () => {
    expect(() => phoneNumberSchema.parse("923000000")).not.toThrow();
    expect(() => phoneNumberSchema.parse("+244 923 000 000")).not.toThrow();
    expect(() => phoneNumberSchema.parse("912345678")).not.toThrow();
    expect(() => phoneNumberSchema.parse("990123456")).not.toThrow();
  });

  it("rejeita prefixos inválidos ou comprimentos incorrectos", () => {
    expect(() => phoneNumberSchema.parse("981234567")).toThrow(); // 98 não é operadora em Angola
    expect(() => phoneNumberSchema.parse("92300000")).toThrow(); // 8 dígitos
    expect(() => phoneNumberSchema.parse("9230000000")).toThrow(); // 10 dígitos sem 244
  });
});

describe("Schemas Numéricos Especializados", () => {
  it("quantitySchema respeita limites", () => {
    const schema = quantitySchema(1, 100, "Lotação");
    expect(schema.parse(50)).toBe(50);
    expect(schema.parse("50")).toBe(50);
    expect(() => schema.parse(0)).toThrow();
    expect(() => schema.parse(101)).toThrow();
  });

  it("currencySchema valida montantes positivos em Kwanzas", () => {
    const schema = currencySchema(0, 1000000);
    expect(schema.parse(50000)).toBe(50000);
    expect(schema.parse("15000.50")).toBe(15000.5);
    expect(() => schema.parse(-10)).toThrow();
  });

  it("percentageSchema valida valores entre 0 e 100", () => {
    const schema = percentageSchema();
    expect(schema.parse(25)).toBe(25);
    expect(schema.parse("100")).toBe(100);
    expect(() => schema.parse(101)).toThrow();
    expect(() => schema.parse(-1)).toThrow();
  });

  it("schoolGradeSchema valida notas angolanas de 0 a 20", () => {
    const schema = schoolGradeSchema();
    expect(schema.parse(14.5)).toBe(14.5);
    expect(schema.parse("20")).toBe(20);
    expect(schema.parse("0")).toBe(0);
    expect(() => schema.parse(20.5)).toThrow();
    expect(() => schema.parse(-0.5)).toThrow();
  });
});
