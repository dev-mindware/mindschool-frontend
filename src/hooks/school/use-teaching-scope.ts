"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/auth";
import { useSections } from "./use-sections";
import { useTeacherAssignments, useTeachers } from "./use-academic";

export interface TeachingSubjectOption {
  id: string;
  name: string;
  sectionSubjectId?: string;
  isMySubject?: boolean;
}

/**
 * Hook para delimitar o escopo de leccionação do utilizador autenticado:
 * - Se for professor (TEACHER): restringe estritamente às turmas e disciplinas onde lecciona.
 * - Se for direcção/admin: disponibiliza visão institucional ampla da escola.
 */
export function useTeachingScope() {
  const { user } = useAuth();
  const { data: allSections = [], isLoading: sectionsLoading } = useSections();
  const { allAssignments = [], isLoading: assignmentsLoading } = useTeacherAssignments();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();

  const isTeacher = user?.role === "TEACHER";

  // Identifica a ficha de professor correspondente ao utilizador autenticado
  const myTeacher = useMemo(() => {
    if (!user) return undefined;
    return teachers.find(
      (t) =>
        (user.id && t.user_id === user.id) ||
        (user.email && t.email?.toLowerCase() === user.email.toLowerCase()),
    );
  }, [user, teachers]);

  // Atribuições docentes do utilizador actual
  const myAssignments = useMemo(() => {
    if (!isTeacher) return allAssignments;
    return allAssignments.filter((a) => {
      if (user?.id && a.teacherUserId && a.teacherUserId === user.id) return true;
      if (myTeacher?.id && a.teacherId === myTeacher.id) return true;
      if (user?.name && a.teacherName.toLowerCase() === user.name.toLowerCase()) return true;
      return false;
    });
  }, [isTeacher, allAssignments, myTeacher, user]);

  // Turmas permitidas para o utilizador
  const mySections = useMemo(() => {
    if (!isTeacher) return allSections;
    const allowedIds = new Set(myAssignments.map((a) => a.sectionId));
    return allSections.filter((s) => allowedIds.has(s.id));
  }, [isTeacher, allSections, myAssignments]);

  const mySectionIds = useMemo(() => new Set(mySections.map((s) => s.id)), [mySections]);

  /**
   * Devolve as disciplinas disponíveis para uma determinada turma:
   * - Para professores: APENAS as disciplinas que ele lecciona na turma seleccionada.
   * - Para direcção/admin: todas as disciplinas com atribuição nessa turma.
   */
  const getSubjectsForSection = useMemo(() => {
    return (sectionId: string): TeachingSubjectOption[] => {
      if (!sectionId) return [];

      if (isTeacher) {
        const relevant = myAssignments.filter((a) => a.sectionId === sectionId);
        const map = new Map<string, TeachingSubjectOption>();
        for (const a of relevant) {
          if (!map.has(a.subjectId)) {
            map.set(a.subjectId, {
              id: a.subjectId,
              name: a.subjectName,
              sectionSubjectId: a.id,
              isMySubject: true,
            });
          }
        }
        return Array.from(map.values());
      }

      // Direcção / Admin: todas as disciplinas atribuídas à turma
      const classAssignments = allAssignments.filter((a) => a.sectionId === sectionId);
      const map = new Map<string, TeachingSubjectOption>();
      for (const a of classAssignments) {
        if (!map.has(a.subjectId)) {
          map.set(a.subjectId, {
            id: a.subjectId,
            name: a.subjectName,
            sectionSubjectId: a.id,
            isMySubject: false,
          });
        }
      }
      return Array.from(map.values());
    };
  }, [isTeacher, myAssignments, allAssignments]);

  /** Verifica se o utilizador pode aceder a esta turma */
  const canAccessSection = (sectionId: string) => {
    if (!isTeacher) return true;
    return mySectionIds.has(sectionId);
  };

  /** Verifica se o professor pode lançar notas nesta disciplina específica da turma */
  const canAccessSubject = (sectionId: string, subjectId: string) => {
    if (!isTeacher) return true;
    return myAssignments.some((a) => a.sectionId === sectionId && a.subjectId === subjectId);
  };

  return {
    isTeacher,
    user,
    myTeacher,
    myAssignments,
    mySections,
    mySectionIds,
    allSections,
    getSubjectsForSection,
    canAccessSection,
    canAccessSubject,
    isLoading: sectionsLoading || assignmentsLoading || teachersLoading,
  };
}
