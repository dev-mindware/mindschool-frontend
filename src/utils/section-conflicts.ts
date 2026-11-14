import type { AcademicSection, Shift } from "@/types";

export const SHIFT_DEFAULT_HOURS: Record<Shift, { start: string; end: string }> = {
  MORNING: { start: "07:30", end: "12:30" },
  AFTERNOON: { start: "13:00", end: "18:00" },
  EVENING: { start: "18:30", end: "22:00" },
  DIURNO: { start: "07:30", end: "17:30" },
};

export const SHIFT_LABELS: Record<Shift, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Noite",
  DIURNO: "Diurno",
};

export function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeSectionName(name: string): string {
  return collapseWhitespace(name).toLowerCase();
}

export function normalizeRoomNumber(room: string | null | undefined): string | null {
  if (!room) return null;
  const collapsed = collapseWhitespace(room);
  if (!collapsed || collapsed === "—") return null;
  return collapsed.toLowerCase();
}

export function parseTimeToMinutes(hhmm: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export interface EffectiveInterval {
  start: string;
  end: string;
  startMinute: number;
  endMinute: number;
}

export function resolveEffectiveSectionTimes(
  shift: Shift,
  startTime?: string | null,
  endTime?: string | null,
): EffectiveInterval {
  const sMin = startTime ? parseTimeToMinutes(startTime) : null;
  const eMin = endTime ? parseTimeToMinutes(endTime) : null;
  if (sMin !== null && eMin !== null && eMin > sMin) {
    return {
      start: startTime!.trim(),
      end: endTime!.trim(),
      startMinute: sMin,
      endMinute: eMin,
    };
  }
  const fallback = SHIFT_DEFAULT_HOURS[shift];
  return {
    start: fallback.start,
    end: fallback.end,
    startMinute: parseTimeToMinutes(fallback.start)!,
    endMinute: parseTimeToMinutes(fallback.end)!,
  };
}

export function intervalsOverlap(
  a: { startMinute: number; endMinute: number },
  b: { startMinute: number; endMinute: number },
): boolean {
  return a.startMinute < b.endMinute && b.startMinute < a.endMinute;
}

export function findDuplicateSectionName(
  candidate: {
    id?: string;
    name: string;
    classLevel: string;
    academicYear: string;
  },
  existing: readonly Pick<AcademicSection, "id" | "name" | "classLevel" | "academicYear">[],
): Pick<AcademicSection, "id" | "name" | "classLevel" | "academicYear"> | null {
  const normName = normalizeSectionName(candidate.name);
  if (!normName) return null;
  return (
    existing.find(
      (s) =>
        s.id !== candidate.id &&
        collapseWhitespace(s.classLevel).toLowerCase() === collapseWhitespace(candidate.classLevel).toLowerCase() &&
        collapseWhitespace(s.academicYear).toLowerCase() === collapseWhitespace(candidate.academicYear).toLowerCase() &&
        normalizeSectionName(s.name) === normName,
    ) ?? null
  );
}

export function findConflictingRoomSection(
  candidate: {
    id?: string;
    roomNumber?: string | null;
    academicYear: string;
    shift: Shift;
    startTime?: string | null;
    endTime?: string | null;
  },
  existing: readonly Pick<
    AcademicSection,
    "id" | "name" | "classLevel" | "academicYear" | "roomNumber" | "shift" | "startTime" | "endTime"
  >[],
): {
  section: Pick<
    AcademicSection,
    "id" | "name" | "classLevel" | "academicYear" | "roomNumber" | "shift" | "startTime" | "endTime"
  >;
  candidateInterval: EffectiveInterval;
  existingInterval: EffectiveInterval;
} | null {
  const candidateRoom = normalizeRoomNumber(candidate.roomNumber);
  if (!candidateRoom) return null;
  const candidateInterval = resolveEffectiveSectionTimes(candidate.shift, candidate.startTime, candidate.endTime);
  const candidateYear = collapseWhitespace(candidate.academicYear).toLowerCase();

  for (const s of existing) {
    if (s.id === candidate.id) continue;
    if (collapseWhitespace(s.academicYear).toLowerCase() !== candidateYear) continue;
    if (normalizeRoomNumber(s.roomNumber) !== candidateRoom) continue;
    const existingInterval = resolveEffectiveSectionTimes(s.shift, s.startTime, s.endTime);
    if (intervalsOverlap(candidateInterval, existingInterval)) {
      return { section: s, candidateInterval, existingInterval };
    }
  }
  return null;
}

