import {
  academicYearSetupSchema,
  admissionGradeExamSchema,
  admissionSessionSchema,
  candidateApplicationPersonalSchema,
  candidateGuardianNewSchema,
  customEmolumentSchema,
  enrollmentNewStudentSchema,
  formalReasonSchema,
  issueDocumentSchema,
  newTeacherSchema,
  portalPaymentMetaSchema,
  schoolInstitutionalSettingsSchema,
  schoolPoliciesSchema,
} from "..";

describe("Schemas de domínio académico, financeiro e institucional", () => {
  it("valida criação de professor (newTeacherSchema)", () => {
    expect(
      newTeacherSchema.safeParse({
        userId: "usr-1",
        documentNumber: "007849302LA042",
        qualification: "Licenciatura em Matemática",
      }).success
    ).toBe(true);

    expect(
      newTeacherSchema.safeParse({
        userId: "",
        documentNumber: "1234",
        qualification: "",
      }).success
    ).toBe(false);
  });

  it("valida matrícula com novo aluno (enrollmentNewStudentSchema)", () => {
    expect(
      enrollmentNewStudentSchema.safeParse({
        selectedSectionId: "sec-1",
        newFullName: "Ana Paula Domingos",
        newGender: "FEMALE",
        newBirthDate: "2012-05-14",
        newIdNumber: "004928172LA041",
      }).success
    ).toBe(true);

    expect(
      enrollmentNewStudentSchema.safeParse({
        selectedSectionId: "sec-1",
        newFullName: "Ana 123",
        newGender: "FEMALE",
        newBirthDate: "2099-01-01",
        newIdNumber: "INVALID",
      }).success
    ).toBe(false);
  });

  it("valida sessão de prova de acesso apenas no futuro (admissionSessionSchema)", () => {
    const futureIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    expect(
      admissionSessionSchema.safeParse({
        title: "Prova de Acesso 10.ª Classe",
        when: futureIso,
        location: "Sala 12",
        capacity: "40",
      }).success
    ).toBe(true);

    expect(
      admissionSessionSchema.safeParse({
        title: "Prova Passada",
        when: "2020-01-01T08:00",
        location: "",
        capacity: 0,
      }).success
    ).toBe(false);
  });

  it("valida dados pessoais do candidato e encarregado conforme o tipo de documento", () => {
    expect(
      candidateApplicationPersonalSchema.safeParse({
        fullName: "Kiara Luísa Gaspar",
        gender: "FEMALE",
        birthDate: "2013-03-10",
        idDocumentType: "IDENTITY_CARD",
        idDocumentNumber: "008432190LA045",
        nationality: "Angolana",
        previousSchoolName: "",
      }).success
    ).toBe(true);

    expect(
      candidateApplicationPersonalSchema.safeParse({
        fullName: "Kiara",
        gender: "FEMALE",
        birthDate: "2013-03-10",
        idDocumentType: "IDENTITY_CARD",
        idDocumentNumber: "123",
        nationality: "Angolana",
        previousSchoolName: "",
      }).success
    ).toBe(false);

    expect(
      candidateGuardianNewSchema.safeParse({
        guardianName: "Gaspar António Gaspar",
        guardianPhone: "+244 923 000 000",
        guardianEmail: "gaspar@exemplo.ao",
      }).success
    ).toBe(true);

    expect(
      candidateGuardianNewSchema.safeParse({
        guardianName: "Gaspar",
        guardianPhone: "900111222",
        guardianEmail: "email-invalido",
      }).success
    ).toBe(false);
  });

  it("valida ano letivo, emissão de documentos e notas/motivos formais", () => {
    expect(
      academicYearSetupSchema.safeParse({
        name: "Ano Letivo 2026/2027",
        startDate: "2026-09-01",
        endDate: "2027-07-15",
      }).success
    ).toBe(true);

    expect(
      academicYearSetupSchema.safeParse({
        name: "2026",
        startDate: "2026-09-01",
        endDate: "2026-08-01",
      }).success
    ).toBe(false);

    expect(
      issueDocumentSchema.safeParse({
        studentId: "stu-1",
        documentType: "HABILITATION_CERTIFICATE",
        purpose: "Matrícula no ensino superior",
        checkedByName: "",
      }).success
    ).toBe(false);

    expect(
      issueDocumentSchema.safeParse({
        studentId: "stu-1",
        documentType: "HABILITATION_CERTIFICATE",
        purpose: "Matrícula no ensino superior",
        checkedByName: "Edson Viegas",
        registryBook: "12",
        registrySheet: "0324",
      }).success
    ).toBe(true);

    expect(formalReasonSchema(5, 500).safeParse({ reason: "abc" }).success).toBe(false);
    expect(admissionGradeExamSchema.safeParse({ examScore: 15.5 }).success).toBe(true);
    expect(admissionGradeExamSchema.safeParse({ examScore: 21 }).success).toBe(false);
  });

  it("valida dados institucionais da escola e cruzamentos de políticas MED", () => {
    expect(
      schoolInstitutionalSettingsSchema.safeParse({
        schoolName: "Colégio Esperança",
        phone: "923 456 789",
        email: "secretaria@esperanca.ao",
        directorGeneralName: "Maria Fernanda Santos",
      }).success
    ).toBe(true);

    expect(
      schoolInstitutionalSettingsSchema.safeParse({
        schoolName: "AB",
        phone: "123",
        directorGeneralName: "Diretor 99",
      }).success
    ).toBe(false);

    expect(
      schoolPoliciesSchema.safeParse({
        evaluation: {
          mt_weights: { mac: 1, mas: 1, pp: 1 },
          pass_mark: 10,
          review_window_days: 10,
          council_min_attendees: 3,
          final_exam: { admission_min_mfd: 7, weight_mfd: 50 },
          exception: {
            enabled: true,
            class_level_min: 8,
            class_level_max: 7,
            max_subjects: 2,
            min_mark: 7,
            max_mark: 9,
          },
        },
        admission: { min_pass_score: 10 },
        calendar: { summary_deadline_days: 2 },
        risk: {
          weights: { frequencia: 1, desempenho: 1, financeiro: 1 },
          thresholds: { moderado: 35, elevado: 65 },
          overdue_days: 30,
        },
        finance: { installments: 10, due_day: 20 },
      }).success
    ).toBe(false);
  });

  it("valida emolumentos e metadados de pagamento do portal", () => {
    expect(
      customEmolumentSchema.safeParse({
        name: "Declaração com notas",
        amount: 2500,
        description: "Emissão urgente em 48h",
      }).success
    ).toBe(true);
    expect(customEmolumentSchema.safeParse({ name: "X", amount: 0 }).success).toBe(false);

    const today = new Date().toISOString().slice(0, 10);
    expect(
      portalPaymentMetaSchema.safeParse({
        paidOn: today,
        reference: "OP-98213",
        payer: "Manuel Joaquim",
        notes: "",
      }).success
    ).toBe(true);

    expect(
      portalPaymentMetaSchema.safeParse({
        paidOn: "2099-12-31",
        payer: "João 123",
      }).success
    ).toBe(false);
  });
});

