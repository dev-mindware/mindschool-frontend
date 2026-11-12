/** @jest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { useTeachingScope } from "@/hooks/school/use-teaching-scope";

jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/hooks/auth", () => ({
  useAuth: () => ({
    user: {
      id: "user-teacher-1",
      name: "Mauro Dinis",
      role: "TEACHER",
    },
  }),
}));

jest.mock("@/stores/school/active-school-store", () => ({
  useActiveSchoolStore: (selector: any) => selector({ schoolId: "school-1" }),
}));

jest.mock("@/hooks/school/use-sections", () => ({
  useSections: () => ({
    data: [
      { id: "sec-1", name: "TESTE 7.ª A", classLevel: "7ª Classe" },
      { id: "sec-2", name: "8.ª B", classLevel: "8ª Classe" },
    ],
    isLoading: false,
  }),
}));

jest.mock("@/hooks/school/use-academic", () => ({
  useTeacherAssignments: () => ({
    allAssignments: [
      {
        id: "assign-1",
        teacherId: "teacher-other",
        teacherUserId: "user-other",
        teacherName: "Outro Docente",
        sectionId: "sec-1",
        subjectId: "sub-fisica",
        subjectName: "Física",
      },
    ],
    isLoading: false,
  }),
  useTeachers: () => ({
    data: [],
    isLoading: false,
  }),
}));

describe("RBAC / ABAC do Professor", () => {
  it("useTeachingScope restringe turmas e disciplinas a apenas as atribuídas ao professor", () => {
    const { result } = renderHook(() => useTeachingScope());

    expect(result.current.isTeacher).toBe(true);
    // Como Mauro Dinis não tem atribuições em assign-1, mySections deve estar vazio
    expect(result.current.mySections).toEqual([]);
    expect(result.current.getSubjectsForSection("sec-1")).toEqual([]);
    expect(result.current.canAccessSection("sec-1")).toBe(false);
    expect(result.current.canAccessSubject("sec-1", "sub-fisica")).toBe(false);
  });
});
