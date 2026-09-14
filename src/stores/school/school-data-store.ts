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

import {
  INITIAL_SECTIONS,
  INITIAL_SUBJECTS,
  INITIAL_GUARDIANS,
  INITIAL_STUDENTS,
  INITIAL_ENROLLMENTS,
  INITIAL_ASSIGNMENTS,
} from "./initial-data";

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
