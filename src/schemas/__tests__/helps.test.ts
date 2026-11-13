import {
  accountNumberSchema,
  angolaBiSchema,
  birthDateSchema,
  currencySchema,
  fullPersonNameSchema,
  ibanSchema,
  isValidAngolanPlate,
  isValidIsbn,
  isValidIsoDate,
  optionalIbanSchema,
  optionalPhoneNumberSchema,
  optionalSwiftBicSchema,
  optionalTaxNumberSchema,
  percentageSchema,
  personNameSchema,
  phoneNumberSchema,
  quantitySchema,
  schoolGradeSchema,
  sanitizeSearchTerm,
  taxNumberSchema,
  timeHHMMSchema,
  totpSixDigitSchema,
  validateIdDocumentByType,
} from "../helps";
import {
  announcementSchema,
  bankAccountSchema,
  libraryBookSchema,
  schoolPoliciesSchema,
  transportRouteSchema,
  tuitionPolicySchema,
  verifyDocumentCodeSchema,
} from "..";

describe("Validadores formais Angola / MED (src/schemas/helps.ts)", () => {
  it("valida nomes pessoais e rejeita dígitos e símbolos", () => {
    const req = personNameSchema();
    expect(req.safeParse("Ana Maria").success).toBe(true);
    expect(req.safeParse("Dr. Manuel D'Almeida").success).toBe(true);
    expect(req.safeParse("João 123").success).toBe(false);
    expect(req.safeParse("Teste@@").success).toBe(false);
    expect(req.safeParse("   ").success).toBe(false);

    const full = fullPersonNameSchema();
    expect(full.safeParse("Mateus").success).toBe(false);
    expect(full.safeParse("Mateus Silva").success).toBe(true);
  });

  it("valida telefones angolanos obrigatórios e opcionais", () => {
    expect(phoneNumberSchema.safeParse("923 456 789").success).toBe(true);
    expect(phoneNumberSchema.safeParse("+244 912 000 111").success).toBe(true);
    expect(phoneNumberSchema.safeParse("").success).toBe(false);
    expect(phoneNumberSchema.safeParse("900 123 456").success).toBe(false);
    expect(phoneNumberSchema.safeParse("12345").success).toBe(false);

    expect(optionalPhoneNumberSchema.safeParse("").success).toBe(true);
    expect(optionalPhoneNumberSchema.safeParse("931 111 222").success).toBe(true);
    expect(optionalPhoneNumberSchema.safeParse("abc").success).toBe(false);
  });

  it("valida BI angolano, Passaporte e Cédula por tipo", () => {
    expect(angolaBiSchema.safeParse("007849302la042").success).toBe(true);
    expect(angolaBiSchema.safeParse("007849302").success).toBe(false);

    expect(validateIdDocumentByType("006274640LA041", "IDENTITY_CARD").valid).toBe(true);
    expect(validateIdDocumentByType("006274640LA041", "bilhete_identidade").valid).toBe(true);
    expect(validateIdDocumentByType("1234", "IDENTITY_CARD").valid).toBe(false);
    expect(validateIdDocumentByType("N1234567", "PASSPORT").valid).toBe(true);
    expect(validateIdDocumentByType("12", "BIRTH_CERTIFICATE").valid).toBe(false);
  });

  it("valida NIF e IBAN angolano mod-97 e SWIFT", () => {
    expect(taxNumberSchema.safeParse("5417002012").success).toBe(true);
    expect(taxNumberSchema.safeParse("007849302LA042").success).toBe(true);
    expect(taxNumberSchema.safeParse("12345").success).toBe(false);
    expect(optionalTaxNumberSchema.safeParse("").success).toBe(true);
    expect(optionalTaxNumberSchema.safeParse("123").success).toBe(false);

    expect(ibanSchema.safeParse("AO06.0040.0000.5660.0824.1017.4").success).toBe(true);
    expect(ibanSchema.safeParse("AO00004000005660082410174").success).toBe(false);
    expect(ibanSchema.safeParse("").success).toBe(false);
    expect(optionalIbanSchema.safeParse("").success).toBe(true);

    expect(accountNumberSchema.safeParse("12345678901234").success).toBe(true);
    expect(accountNumberSchema.safeParse("12345").success).toBe(false);

    expect(optionalSwiftBicSchema.safeParse("").success).toBe(true);
    expect(optionalSwiftBicSchema.safeParse("bfaoaoao").success).toBe(true);
    expect(optionalSwiftBicSchema.safeParse("123").success).toBe(false);
  });

  it("valida ISBN-10/13, matrículas AO, TOTP e pesquisas", () => {
    expect(isValidIsbn("978-0-306-40615-7")).toBe(true);
    expect(isValidIsbn("0-306-40615-2")).toBe(true);
    expect(isValidIsbn("978-0-306-40615-8")).toBe(false);

    expect(isValidAngolanPlate("LD-12-34-AB")).toBe(true);
    expect(isValidAngolanPlate("LD-123-AA")).toBe(true);
    expect(isValidAngolanPlate("INVALID")).toBe(false);

    expect(totpSixDigitSchema.safeParse("123456").success).toBe(true);
    expect(totpSixDigitSchema.safeParse("12a456").success).toBe(false);

    expect(sanitizeSearchTerm("  olá \u0007  mundo  ", 20)).toBe("olá mundo");
  });

  it("rejeita strings vazias em campos numéricos (sem coerção silenciosa para 0) e valida notas MED", () => {
    const grade = schoolGradeSchema();
    expect(grade.safeParse("").success).toBe(false);
    expect(grade.safeParse(NaN).success).toBe(false);
    expect(grade.safeParse(-1).success).toBe(false);
    expect(grade.safeParse(20.1).success).toBe(false);
    expect(grade.safeParse(14.25).success).toBe(true);
    expect(grade.safeParse(14.125).success).toBe(false);

    expect(quantitySchema(1, 100).safeParse("").success).toBe(false);
    expect(quantitySchema(1, 100).safeParse(1.5).success).toBe(false);
    expect(currencySchema(1).safeParse("").success).toBe(false);
    expect(percentageSchema(0, 100).safeParse(101).success).toBe(false);
  });

  it("valida datas de calendário reais, horas e intervalo de idade", () => {
    expect(isValidIsoDate("2024-02-29")).toBe(true);
    expect(isValidIsoDate("2025-02-29")).toBe(false);
    expect(isValidIsoDate("2025-02-31")).toBe(false);

    expect(timeHHMMSchema().safeParse("08:30").success).toBe(true);
    expect(timeHHMMSchema().safeParse("25:00").success).toBe(false);

    const birth = birthDateSchema(3, 100);
    expect(birth.safeParse("2099-01-01").success).toBe(false);
    expect(birth.safeParse("2012-05-10").success).toBe(true);
  });

  it("valida schemas compostos de domínio (finanças, políticas, recursos)", () => {
    expect(
      tuitionPolicySchema.safeParse({
        monthlyAmount: 25000,
        registrationFee: 5000,
        dueStartDay: 15,
        dueDay: 10,
        graceDays: 2,
        latePenaltyType: "percentage",
        latePenaltyValue: 10,
        monthlyIncreaseType: "percentage",
        monthlyIncreaseValue: 5,
        emailEnabled: true,
        preDueDays: 5,
      }).success
    ).toBe(false);

    expect(
      bankAccountSchema.safeParse({
        bankName: "BAI",
        accountHolder: "Colégio Esperança",
        iban: "AO06.0040.0000.5660.0824.1017.4",
        accountNumber: "",
        swift: "BAIPAOLU",
        instructions: "",
      }).success
    ).toBe(true);

    expect(
      libraryBookSchema.safeParse({
        title: "Terra Sonâmbula",
        author: "Mia Couto",
        isbn: "978-0-306-40615-7",
        copies: 5,
        category: "",
        location: "",
      }).success
    ).toBe(true);

    expect(
      transportRouteSchema.safeParse({
        name: "Rota Norte",
        plate: "LD-12-34-AB",
        capacity: 30,
        driver: "Manuel Domingos",
        phone: "923 000 000",
        stops: [{ name: "", time: "07:30" }],
      }).success
    ).toBe(false);

    expect(
      announcementSchema.safeParse({
        title: "Aviso Geral",
        body: "Caros encarregados, reunião sexta-feira.",
        audience: "turma",
        sectionId: "",
      }).success
    ).toBe(false);

    expect(
      schoolPoliciesSchema.safeParse({
        evaluation: {
          mt_weights: { mac: 0, mas: 0, pp: 0 },
          pass_mark: 10,
          review_window_days: 10,
          council_min_attendees: 3,
          final_exam: { admission_min_mfd: 7, weight_mfd: 50 },
          exception: { enabled: true, class_level_min: 7, class_level_max: 8, max_subjects: 2, min_mark: 7, max_mark: 9 },
        },
        admission: { min_pass_score: 10 },
        calendar: { summary_deadline_days: 1 },
        risk: { weights: { frequencia: 1, desempenho: 1, financeiro: 1 }, thresholds: { moderado: 35, elevado: 65 }, overdue_days: 30 },
        finance: { installments: 10, due_day: 20 },
      }).success
    ).toBe(false);

    expect(verifyDocumentCodeSchema.safeParse({ documentNumber: "dec-5000000001-2026-000001" }).success).toBe(true);
    expect(verifyDocumentCodeSchema.safeParse({ documentNumber: "abc" }).success).toBe(false);
  });
});

