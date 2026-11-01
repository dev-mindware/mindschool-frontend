import api from "./api";

export type Outcome = "aprovado" | "nao_aprovado" | "indefinido";
export type AttendanceStatus = "presente" | "falta_justificada" | "falta_injustificada" | "atraso";

export interface SectionPanel {
  section: { id: string; name: string; shift: string; class_level: string; capacity: number; homeroom_teacher: { id: string; full_name: string } | null };
  term: { id: string; sequence: number; start_date: string; end_date: string };
  pauta_status: "aberta" | "fechada" | "reaberta";
  pass_mark: number;
  students: { total: number; male: number; female: number; unspecified: number };
  grades: { expected: number; done: number; percent: number };
  subjects: Array<{ section_subject_id: string; name: string; teacher_name: string; expected: number; done: number; missing: number }>;
  list: Array<{
    enrollment_id: string;
    full_name: string;
    process_number: string | null;
    outcome: Outcome;
    failing_subjects: number;
    failing_subject_names: string[];
    missing_subjects: number;
    lessons: number;
    absences: number;
    attendance_rate: number | null;
  }>;
  generated_on: string;
}

export interface AttendanceReportData {
  section: { id: string; name: string; class_level: string };
  from: string;
  to: string;
  students: Array<{ enrollment_id: string; full_name: string; process_number: string | null }>;
  subjects: Array<{ section_subject_id: string; name: string }>;
  records: Array<{ enrollment_id: string; section_subject_id: string; date: string; status: AttendanceStatus }>;
}

export interface SectionTimetable {
  days: Array<{
    weekday: number;
    entries: Array<{ id: string; subject: { name: string }; teacher: { full_name: string }; first_slot: number; start: string; end: string; room: { code?: string; name?: string } | null }>;
  }>;
}

export const coordinationService = {
  timetable: async (sectionId: string): Promise<SectionTimetable> => (await api.get<SectionTimetable>(`/s/timetable/sections/${sectionId}`)).data,

  panel: async (sectionId: string, termId: string): Promise<SectionPanel> =>
    (await api.get<SectionPanel>(`/s/sections/${sectionId}/panel`, { params: { term_id: termId } })).data,

  attendanceReport: async (sectionId: string, from: string, to: string): Promise<AttendanceReportData> =>
    (await api.get<AttendanceReportData>(`/s/sections/${sectionId}/attendance-report`, { params: { from, to } })).data,
};
