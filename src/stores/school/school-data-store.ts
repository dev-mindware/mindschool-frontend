import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Student,
  Enrollment,
  Guardian,
  AcademicSection,
  Subject,
  TeacherAssignment,
  EnrollmentFormData,
  CancelEnrollmentFormData,
} from "@/types";

// Initial realistic Angolan school mock data
const INITIAL_SECTIONS: AcademicSection[] = [
  {
    id: "sec-7a",
    schoolId: "dev-school-1",
    name: "7ª Classe A",
    classLevel: "7ª Classe",
    cycle: "LOWER_SECONDARY",
    shift: "MORNING",
    roomNumber: "Sala 04",
    capacity: 45,
    currentEnrollmentCount: 42,
    academicYear: "2025/2026",
    mainTeacherName: "Prof. Domingos Kiala",
    isActive: true,
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "sec-7b",
    schoolId: "dev-school-1",
    name: "7ª Classe B",
    classLevel: "7ª Classe",
    cycle: "LOWER_SECONDARY",
    shift: "AFTERNOON",
    roomNumber: "Sala 04",
    capacity: 45,
    currentEnrollmentCount: 38,
    academicYear: "2025/2026",
    mainTeacherName: "Prof.ª Teresa Cassoma",
    isActive: true,
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "sec-10a",
    schoolId: "dev-school-1",
    name: "10ª Classe - Ciências Físicas e Biológicas",
    classLevel: "10ª Classe",
    cycle: "UPPER_SECONDARY",
    shift: "MORNING",
    roomNumber: "Sala 12",
    capacity: 40,
    currentEnrollmentCount: 39,
    academicYear: "2025/2026",
    mainTeacherName: "Prof. Manuel Neto",
    isActive: true,
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "sec-10b",
    schoolId: "dev-school-1",
    name: "10ª Classe - Ciências Económicas e Jurídicas",
    classLevel: "10ª Classe",
    cycle: "UPPER_SECONDARY",
    shift: "MORNING",
    roomNumber: "Sala 14",
    capacity: 40,
    currentEnrollmentCount: 36,
    academicYear: "2025/2026",
    mainTeacherName: "Prof.ª Ana Paula Santos",
    isActive: true,
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "sec-11inf",
    schoolId: "dev-school-1",
    name: "11ª Classe - Técnico de Informática",
    classLevel: "11ª Classe",
    cycle: "UPPER_SECONDARY",
    shift: "MORNING",
    roomNumber: "Laboratório 2",
    capacity: 35,
    currentEnrollmentCount: 34,
    academicYear: "2025/2026",
    mainTeacherName: "Eng.º António Sebastião",
    isActive: true,
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "sec-12inf",
    schoolId: "dev-school-1",
    name: "12ª Classe - Técnico de Informática",
    classLevel: "12ª Classe",
    cycle: "UPPER_SECONDARY",
    shift: "AFTERNOON",
    roomNumber: "Laboratório 1",
    capacity: 35,
    currentEnrollmentCount: 30,
    academicYear: "2025/2026",
    mainTeacherName: "Prof. Carlos Mbemba",
    isActive: true,
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
];

const INITIAL_SUBJECTS: Subject[] = [
  {
    id: "sub-lp",
    schoolId: "dev-school-1",
    name: "Língua Portuguesa",
    code: "LP",
    cycle: "LOWER_SECONDARY",
    weeklyHours: 5,
    isActive: true,
    isCore: true,
    description: "Comunicação, gramática e literatura em língua portuguesa",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "sub-mat",
    schoolId: "dev-school-1",
    name: "Matemática",
    code: "MAT",
    cycle: "LOWER_SECONDARY",
    weeklyHours: 5,
    isActive: true,
    isCore: true,
    description: "Álgebra, geometria plana e cálculo",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "sub-fis",
    schoolId: "dev-school-1",
    name: "Física",
    code: "FIS",
    cycle: "UPPER_SECONDARY",
    weeklyHours: 4,
    isActive: true,
    isCore: true,
    description: "Mecânica, termodinâmica e eletromagnetismo",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "sub-qui",
    schoolId: "dev-school-1",
    name: "Química",
    code: "QUI",
    cycle: "UPPER_SECONDARY",
    weeklyHours: 4,
    isActive: true,
    isCore: true,
    description: "Química geral, orgânica e reações",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "sub-prog",
    schoolId: "dev-school-1",
    name: "Técnicas e Linguagens de Programação",
    code: "TLP",
    cycle: "UPPER_SECONDARY",
    weeklyHours: 6,
    isActive: true,
    isCore: true,
    description: "Lógica de programação, algoritmos e desenvolvimento",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "sub-ing",
    schoolId: "dev-school-1",
    name: "Língua Inglesa",
    code: "ING",
    cycle: "UPPER_SECONDARY",
    weeklyHours: 3,
    isActive: true,
    isCore: false,
    description: "Inglês instrumental e conversação",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "sub-hist",
    schoolId: "dev-school-1",
    name: "História",
    code: "HIST",
    cycle: "LOWER_SECONDARY",
    weeklyHours: 3,
    isActive: true,
    isCore: false,
    description: "História de Angola e universal",
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2025-09-01T08:00:00Z",
  },
];

const INITIAL_GUARDIANS: Guardian[] = [
  {
    id: "guard-1",
    schoolId: "dev-school-1",
    fullName: "Manuel de Jesus Francisco",
    idDocumentType: "BI",
    idDocumentNumber: "004312876LA031",
    phonePrimary: "+244 923 456 789",
    phoneSecondary: "+244 912 345 678",
    email: "manuel.francisco@empresa.ao",
    address: "Bairro Alvalade, Rua Comandante Gika, Luanda",
    profession: "Engenheiro Civil",
    workplace: "Construtora Nacional",
    preferredContactChannel: "WHATSAPP",
    wards: [
      {
        studentId: "stu-1",
        studentName: "Mauro Kiala Francisco",
        relationship: "FATHER",
        isPrimaryContact: true,
      },
      {
        studentId: "stu-2",
        studentName: "Aura Celma Francisco",
        relationship: "FATHER",
        isPrimaryContact: true,
      },
    ],
    createdAt: "2025-08-15T09:00:00Z",
    updatedAt: "2026-01-10T11:00:00Z",
  },
  {
    id: "guard-2",
    schoolId: "dev-school-1",
    fullName: "Esperança dos Santos Baptista",
    idDocumentType: "BI",
    idDocumentNumber: "005923184LA042",
    phonePrimary: "+244 931 224 466",
    email: "esperanca.baptista@gmail.com",
    address: "Centralidade do Kilamba, Bloco G, Apt 302, Luanda",
    profession: "Contabilista Certificada",
    workplace: "Banco Comercial Angolano",
    preferredContactChannel: "WHATSAPP",
    wards: [
      {
        studentId: "stu-3",
        studentName: "Edilson Baptista da Silva",
        relationship: "MOTHER",
        isPrimaryContact: true,
      },
      {
        studentId: "stu-6",
        studentName: "Miraldina Neves Quipungo",
        relationship: "UNCLE",
        isPrimaryContact: true,
      },
    ],
    createdAt: "2025-08-18T10:00:00Z",
    updatedAt: "2026-01-12T14:30:00Z",
  },
  {
    id: "guard-3",
    schoolId: "dev-school-1",
    fullName: "Joaquim Bernardo Capoco",
    idDocumentType: "BI",
    idDocumentNumber: "002874152LA028",
    phonePrimary: "+244 945 112 233",
    email: "capoco.joaquim@sonangol.co.ao",
    address: "Talatona, Condomínio Luanda Sul, Luanda",
    profession: "Gestor de Operações",
    workplace: "Sonangol E.P.",
    preferredContactChannel: "SMS",
    wards: [
      {
        studentId: "stu-4",
        studentName: "Yara Luísa Capoco",
        relationship: "LEGAL_GUARDIAN",
        isPrimaryContact: true,
      },
    ],
    createdAt: "2025-08-20T11:00:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: "stu-1",
    schoolId: "dev-school-1",
    studentNumber: "MS-2026-0012",
    fullName: "Mauro Kiala Francisco",
    gender: "MALE",
    birthDate: "2009-04-14",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "008431920LA045",
    nationality: "Angolana",
    address: "Bairro Alvalade, Luanda",
    city: "Luanda",
    province: "Luanda",
    status: "ENROLLED",
    guardianId: "guard-1",
    guardianName: "Manuel de Jesus Francisco",
    guardianPhone: "+244 923 456 789",
    guardianRelationship: "Pai",
    currentSectionId: "sec-10a",
    currentSectionName: "10ª Classe - CFB",
    currentClassLevel: "10ª Classe",
    academicYear: "2025/2026",
    createdAt: "2025-08-25T10:00:00Z",
    updatedAt: "2026-01-10T11:00:00Z",
  },
  {
    id: "stu-2",
    schoolId: "dev-school-1",
    studentNumber: "MS-2026-0013",
    fullName: "Aura Celma Francisco",
    gender: "FEMALE",
    birthDate: "2012-08-21",
    idDocumentType: "BIRTH_CERTIFICATE",
    idDocumentNumber: "14820/2012",
    nationality: "Angolana",
    address: "Bairro Alvalade, Luanda",
    city: "Luanda",
    province: "Luanda",
    status: "ENROLLED",
    guardianId: "guard-1",
    guardianName: "Manuel de Jesus Francisco",
    guardianPhone: "+244 923 456 789",
    guardianRelationship: "Pai",
    currentSectionId: "sec-7a",
    currentSectionName: "7ª Classe A",
    currentClassLevel: "7ª Classe",
    academicYear: "2025/2026",
    createdAt: "2025-08-25T10:30:00Z",
    updatedAt: "2026-01-10T11:00:00Z",
  },
  {
    id: "stu-3",
    schoolId: "dev-school-1",
    studentNumber: "MS-2026-0025",
    fullName: "Edilson Baptista da Silva",
    gender: "MALE",
    birthDate: "2008-11-03",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "007219485LA039",
    nationality: "Angolana",
    address: "Centralidade do Kilamba, Luanda",
    city: "Belas",
    province: "Luanda",
    status: "ENROLLED",
    guardianId: "guard-2",
    guardianName: "Esperança dos Santos Baptista",
    guardianPhone: "+244 931 224 466",
    guardianRelationship: "Mãe",
    currentSectionId: "sec-11inf",
    currentSectionName: "11ª Classe - Informática",
    currentClassLevel: "11ª Classe",
    academicYear: "2025/2026",
    createdAt: "2025-08-26T14:00:00Z",
    updatedAt: "2026-01-12T14:30:00Z",
  },
  {
    id: "stu-4",
    schoolId: "dev-school-1",
    studentNumber: "MS-2026-0038",
    fullName: "Yara Luísa Capoco",
    gender: "FEMALE",
    birthDate: "2009-02-18",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "008931274LA049",
    nationality: "Angolana",
    address: "Talatona, Luanda",
    city: "Talatona",
    province: "Luanda",
    status: "ENROLLED",
    guardianId: "guard-3",
    guardianName: "Joaquim Bernardo Capoco",
    guardianPhone: "+244 945 112 233",
    guardianRelationship: "Tutor",
    currentSectionId: "sec-10b",
    currentSectionName: "10ª Classe - CEJ",
    currentClassLevel: "10ª Classe",
    academicYear: "2025/2026",
    createdAt: "2025-08-27T09:15:00Z",
    updatedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "stu-5",
    schoolId: "dev-school-1",
    studentNumber: "MS-2026-0044",
    fullName: "Cláudio Afonso de Carvalho",
    gender: "MALE",
    birthDate: "2009-07-30",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "008129375LA041",
    nationality: "Angolana",
    address: "Maianga, Luanda",
    city: "Luanda",
    province: "Luanda",
    status: "PENDING",
    guardianId: "guard-1",
    guardianName: "Manuel de Jesus Francisco",
    guardianPhone: "+244 923 456 789",
    guardianRelationship: "Encarregado",
    currentSectionId: "sec-10a",
    currentSectionName: "10ª Classe - CFB",
    currentClassLevel: "10ª Classe",
    academicYear: "2025/2026",
    createdAt: "2026-02-01T15:00:00Z",
    updatedAt: "2026-02-01T15:00:00Z",
  },
  {
    id: "stu-6",
    schoolId: "dev-school-1",
    studentNumber: "MS-2026-0050",
    fullName: "Miraldina Neves Quipungo",
    gender: "FEMALE",
    birthDate: "2012-05-12",
    idDocumentType: "IDENTITY_CARD",
    idDocumentNumber: "009418273LA052",
    nationality: "Angolana",
    address: "Cazenga, Luanda",
    city: "Cazenga",
    province: "Luanda",
    status: "ENROLLED",
    guardianId: "guard-2",
    guardianName: "Esperança dos Santos Baptista",
    guardianPhone: "+244 931 224 466",
    guardianRelationship: "Tia",
    currentSectionId: "sec-7b",
    currentSectionName: "7ª Classe B",
    currentClassLevel: "7ª Classe",
    academicYear: "2025/2026",
    createdAt: "2025-08-30T11:00:00Z",
    updatedAt: "2026-01-10T10:00:00Z",
  },
];

const INITIAL_ENROLLMENTS: Enrollment[] = [
  {
    id: "enr-1",
    schoolId: "dev-school-1",
    enrollmentNumber: "MAT-2026/0012",
    studentId: "stu-1",
    studentName: "Mauro Kiala Francisco",
    studentNumber: "MS-2026-0012",
    academicYearId: "ay-2026",
    academicYear: "2025/2026",
    sectionId: "sec-10a",
    sectionName: "10ª Classe - CFB",
    classLevelId: "cl-10",
    classLevelName: "10ª Classe",
    shift: "Manhã",
    enrollmentDate: "2025-08-25",
    status: "ACTIVE",
    tuitionPlanId: "plan-puniv",
    tuitionPlanName: "Plano Regular II Ciclo",
    monthlyTuitionPrice: 35000,
    hasScholarship: false,
    createdAt: "2025-08-25T10:00:00Z",
    updatedAt: "2025-08-25T10:00:00Z",
  },
  {
    id: "enr-2",
    schoolId: "dev-school-1",
    enrollmentNumber: "MAT-2026/0013",
    studentId: "stu-2",
    studentName: "Aura Celma Francisco",
    studentNumber: "MS-2026-0013",
    academicYearId: "ay-2026",
    academicYear: "2025/2026",
    sectionId: "sec-7a",
    sectionName: "7ª Classe A",
    classLevelId: "cl-7",
    classLevelName: "7ª Classe",
    shift: "Manhã",
    enrollmentDate: "2025-08-25",
    status: "ACTIVE",
    tuitionPlanId: "plan-first-cycle",
    tuitionPlanName: "Plano Regular I Ciclo",
    monthlyTuitionPrice: 28000,
    hasScholarship: false,
    createdAt: "2025-08-25T10:30:00Z",
    updatedAt: "2025-08-25T10:30:00Z",
  },
  {
    id: "enr-3",
    schoolId: "dev-school-1",
    enrollmentNumber: "MAT-2026/0025",
    studentId: "stu-3",
    studentName: "Edilson Baptista da Silva",
    studentNumber: "MS-2026-0025",
    academicYearId: "ay-2026",
    academicYear: "2025/2026",
    sectionId: "sec-11inf",
    sectionName: "11ª Classe - Informática",
    classLevelId: "cl-11",
    classLevelName: "11ª Classe",
    shift: "Manhã",
    enrollmentDate: "2025-08-26",
    status: "ACTIVE",
    tuitionPlanId: "plan-tech",
    tuitionPlanName: "Plano Técnico Profissional",
    monthlyTuitionPrice: 42000,
    hasScholarship: true,
    scholarshipPercentage: 15,
    createdAt: "2025-08-26T14:00:00Z",
    updatedAt: "2025-08-26T14:00:00Z",
  },
  {
    id: "enr-4",
    schoolId: "dev-school-1",
    enrollmentNumber: "MAT-2026/0038",
    studentId: "stu-4",
    studentName: "Yara Luísa Capoco",
    studentNumber: "MS-2026-0038",
    academicYearId: "ay-2026",
    academicYear: "2025/2026",
    sectionId: "sec-10b",
    sectionName: "10ª Classe - CEJ",
    classLevelId: "cl-10",
    classLevelName: "10ª Classe",
    shift: "Manhã",
    enrollmentDate: "2025-08-27",
    status: "ACTIVE",
    tuitionPlanId: "plan-puniv",
    tuitionPlanName: "Plano Regular II Ciclo",
    monthlyTuitionPrice: 35000,
    hasScholarship: false,
    createdAt: "2025-08-27T09:15:00Z",
    updatedAt: "2025-08-27T09:15:00Z",
  },
];

const INITIAL_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: "asg-1",
    schoolId: "dev-school-1",
    teacherId: "tch-1",
    teacherName: "Prof. Domingos Kiala",
    teacherEmail: "domingos.kiala@mindschool.ao",
    teacherPhone: "923112233",
    sectionId: "sec-7a",
    sectionName: "7ª Classe A",
    subjectId: "sub-mat",
    subjectName: "Matemática",
    weeklyHours: 5,
    academicYear: "2025/2026",
    createdAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "asg-2",
    schoolId: "dev-school-1",
    teacherId: "tch-2",
    teacherName: "Prof.ª Teresa Cassoma",
    teacherEmail: "teresa.cassoma@mindschool.ao",
    teacherPhone: "924334455",
    sectionId: "sec-7a",
    sectionName: "7ª Classe A",
    subjectId: "sub-lp",
    subjectName: "Língua Portuguesa",
    weeklyHours: 5,
    academicYear: "2025/2026",
    createdAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "asg-3",
    schoolId: "dev-school-1",
    teacherId: "tch-3",
    teacherName: "Prof. Manuel Neto",
    teacherEmail: "manuel.neto@mindschool.ao",
    teacherPhone: "925556677",
    sectionId: "sec-10a",
    sectionName: "10ª Classe - CFB",
    subjectId: "sub-fis",
    subjectName: "Física",
    weeklyHours: 4,
    academicYear: "2025/2026",
    createdAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "asg-4",
    schoolId: "dev-school-1",
    teacherId: "tch-4",
    teacherName: "Eng.º António Sebastião",
    teacherEmail: "antonio.sebastiao@mindschool.ao",
    teacherPhone: "926778899",
    sectionId: "sec-11inf",
    sectionName: "11ª Classe - Informática",
    subjectId: "sub-prog",
    subjectName: "Técnicas e Linguagens de Programação",
    weeklyHours: 6,
    academicYear: "2025/2026",
    createdAt: "2025-09-01T08:00:00Z",
  },
];

interface SchoolDataState {
  students: Student[];
  enrollments: Enrollment[];
  guardians: Guardian[];
  sections: AcademicSection[];
  subjects: Subject[];
  assignments: TeacherAssignment[];

  // Student Actions
  addStudent: (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Enrollment Actions
  enrollStudent: (formData: EnrollmentFormData) => Enrollment;
  cancelEnrollment: (enrollmentId: string, data: { reason: string; cancellationDate: string }) => void;

  // Guardian Actions
  addGuardian: (guardian: Omit<Guardian, "id" | "createdAt" | "updatedAt">) => Guardian;
  updateGuardian: (id: string, data: Partial<Guardian>) => void;

  // Section Actions
  addSection: (section: Omit<AcademicSection, "id" | "createdAt" | "updatedAt" | "currentEnrollmentCount">) => AcademicSection;
  updateSection: (id: string, data: Partial<AcademicSection>) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, "id" | "createdAt" | "updatedAt">) => Subject;
  updateSubject: (id: string, data: Partial<Subject>) => void;

  // Teacher Assignment Actions
  assignTeacher: (assignment: Omit<TeacherAssignment, "id" | "createdAt">) => TeacherAssignment;
  removeAssignment: (id: string) => void;

  // Reset
  resetToDefaults: () => void;
}

export const useSchoolDataStore = create<SchoolDataState>()(
  persist(
    (set, get) => ({
      students: INITIAL_STUDENTS,
      enrollments: INITIAL_ENROLLMENTS,
      guardians: INITIAL_GUARDIANS,
      sections: INITIAL_SECTIONS,
      subjects: INITIAL_SUBJECTS,
      assignments: INITIAL_ASSIGNMENTS,

      addStudent: (studentData) => {
        const now = new Date().toISOString();
        const id = `stu-${Date.now()}`;
        const newStudent: Student = {
          ...studentData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ students: [newStudent, ...state.students] }));
        return newStudent;
      },

      updateStudent: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: now } : s
          ),
        }));
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
          enrollments: state.enrollments.filter((e) => e.studentId !== id),
        }));
      },

      enrollStudent: (formData) => {
        const now = new Date().toISOString();
        const enrollmentId = `enr-${Date.now()}`;
        const count = get().enrollments.length + 1;
        const enrollmentNumber = `MAT-2026/${String(count).padStart(4, "0")}`;

        let studentId = formData.studentId;
        let studentName = "";
        let studentNumber = "";

        if (formData.isNewStudent && formData.newStudentData) {
          const newStu = get().addStudent({
            schoolId: "dev-school-1",
            studentNumber: `MS-2026-${String(get().students.length + 1).padStart(4, "0")}`,
            fullName: formData.newStudentData.fullName,
            gender: formData.newStudentData.gender,
            birthDate: formData.newStudentData.birthDate,
            idDocumentType: formData.newStudentData.idDocumentType,
            idDocumentNumber: formData.newStudentData.idDocumentNumber,
            nationality: "Angolana",
            address: "Luanda, Angola",
            city: "Luanda",
            province: "Luanda",
            status: "ENROLLED",
            guardianId: "guard-1",
            guardianName: formData.newStudentData.guardianName,
            guardianPhone: formData.newStudentData.guardianPhone,
            guardianRelationship: formData.newStudentData.guardianRelationship,
            currentSectionId: formData.sectionId,
            currentSectionName: "",
            currentClassLevel: "",
            academicYear: formData.academicYear || "2025/2026",
          });
          studentId = newStu.id;
          studentName = newStu.fullName;
          studentNumber = newStu.studentNumber;
        } else {
          const existing = get().students.find((s) => s.id === studentId);
          if (existing) {
            studentName = existing.fullName;
            studentNumber = existing.studentNumber;
            get().updateStudent(existing.id, {
              status: "ENROLLED",
              currentSectionId: formData.sectionId,
            });
          }
        }

        const targetSection = get().sections.find((s) => s.id === formData.sectionId);
        const sectionName = targetSection ? targetSection.name : "Turma Selecionada";
        const classLevelName = targetSection ? targetSection.classLevel : "Classe";
        const shift = targetSection
          ? targetSection.shift === "MORNING"
            ? "Manhã"
            : targetSection.shift === "AFTERNOON"
            ? "Tarde"
            : "Noite"
          : "Manhã";

        const newEnrollment: Enrollment = {
          id: enrollmentId,
          schoolId: "dev-school-1",
          enrollmentNumber,
          studentId: studentId!,
          studentName,
          studentNumber,
          academicYearId: "ay-2026",
          academicYear: formData.academicYear || "2025/2026",
          sectionId: formData.sectionId,
          sectionName,
          classLevelId: formData.classLevelId,
          classLevelName,
          shift,
          enrollmentDate: now.split("T")[0],
          status: "ACTIVE",
          tuitionPlanId: formData.tuitionPlanId,
          tuitionPlanName: "Plano Padrão de Propinas",
          monthlyTuitionPrice: 35000,
          notes: formData.notes,
          createdAt: now,
          updatedAt: now,
        };

        // Increment section enrollment count
        if (targetSection) {
          get().updateSection(targetSection.id, {
            currentEnrollmentCount: targetSection.currentEnrollmentCount + 1,
          });
        }

        set((state) => ({ enrollments: [newEnrollment, ...state.enrollments] }));
        return newEnrollment;
      },

      cancelEnrollment: (enrollmentId, { reason, cancellationDate }) => {
        const now = new Date().toISOString();
        const enrollment = get().enrollments.find((e) => e.id === enrollmentId);

        set((state) => ({
          enrollments: state.enrollments.map((e) =>
            e.id === enrollmentId
              ? {
                  ...e,
                  status: "CANCELLED",
                  cancellationReason: reason,
                  cancellationDate,
                  updatedAt: now,
                }
              : e
          ),
        }));

        if (enrollment) {
          get().updateStudent(enrollment.studentId, { status: "CANCELLED" });
          const sec = get().sections.find((s) => s.id === enrollment.sectionId);
          if (sec && sec.currentEnrollmentCount > 0) {
            get().updateSection(sec.id, {
              currentEnrollmentCount: sec.currentEnrollmentCount - 1,
            });
          }
        }
      },

      addGuardian: (guardianData) => {
        const now = new Date().toISOString();
        const id = `guard-${Date.now()}`;
        const newGuardian: Guardian = {
          ...guardianData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ guardians: [newGuardian, ...state.guardians] }));
        return newGuardian;
      },

      updateGuardian: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          guardians: state.guardians.map((g) =>
            g.id === id ? { ...g, ...data, updatedAt: now } : g
          ),
        }));
      },

      addSection: (sectionData) => {
        const now = new Date().toISOString();
        const id = `sec-${Date.now()}`;
        const newSection: AcademicSection = {
          ...sectionData,
          id,
          currentEnrollmentCount: 0,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ sections: [...state.sections, newSection] }));
        return newSection;
      },

      updateSection: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: now } : s
          ),
        }));
      },

      addSubject: (subjectData) => {
        const now = new Date().toISOString();
        const id = `sub-${Date.now()}`;
        const newSubject: Subject = {
          ...subjectData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ subjects: [...state.subjects, newSubject] }));
        return newSubject;
      },

      updateSubject: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: now } : s
          ),
        }));
      },

      assignTeacher: (assignmentData) => {
        const now = new Date().toISOString();
        const id = `asg-${Date.now()}`;
        const newAssignment: TeacherAssignment = {
          ...assignmentData,
          id,
          createdAt: now,
        };
        set((state) => ({ assignments: [...state.assignments, newAssignment] }));
        return newAssignment;
      },

      removeAssignment: (id) => {
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        }));
      },

      resetToDefaults: () => {
        set({
          students: INITIAL_STUDENTS,
          enrollments: INITIAL_ENROLLMENTS,
          guardians: INITIAL_GUARDIANS,
          sections: INITIAL_SECTIONS,
          subjects: INITIAL_SUBJECTS,
          assignments: INITIAL_ASSIGNMENTS,
        });
      },
    }),
    {
      name: "mindschool-academic-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
