import {
  collapseWhitespace,
  findConflictingRoomSection,
  findDuplicateSectionName,
  intervalsOverlap,
  normalizeRoomNumber,
  normalizeSectionName,
  resolveEffectiveSectionTimes,
} from "@/utils/section-conflicts";

describe("section-conflicts (frontend)", () => {
  it("normalizes section names and ignores placeholder room values", () => {
    expect(collapseWhitespace("  Turma   A ")).toBe("Turma A");
    expect(normalizeSectionName("  Turma   A ")).toBe("turma a");
    expect(normalizeSectionName("TURMA a")).toBe("turma a");
    expect(normalizeRoomNumber("—")).toBeNull();
    expect(normalizeRoomNumber("   ")).toBeNull();
    expect(normalizeRoomNumber("  Sala   02 ")).toBe("sala 02");
  });

  it("detects duplicate section names per class level and academic year", () => {
    const existing = [
      { id: "s1", name: "Turma A", classLevel: "7ª Classe", academicYear: "2026/2027" },
    ];

    expect(
      findDuplicateSectionName(
        { name: "  turma   a ", classLevel: "7ª Classe", academicYear: "2026/2027" },
        existing,
      )?.id,
    ).toBe("s1");

    // Different class level allows same name
    expect(
      findDuplicateSectionName(
        { name: "Turma A", classLevel: "8ª Classe", academicYear: "2026/2027" },
        existing,
      ),
    ).toBeNull();

    // Editing self does not self-collide
    expect(
      findDuplicateSectionName(
        { id: "s1", name: "turma a", classLevel: "7ª Classe", academicYear: "2026/2027" },
        existing,
      ),
    ).toBeNull();
  });

  it("detects overlapping room schedules and allows different shifts or contiguous slots", () => {
    expect(intervalsOverlap({ startMinute: 450, endMinute: 600 }, { startMinute: 600, endMinute: 750 })).toBe(false);
    expect(resolveEffectiveSectionTimes("MORNING").start).toBe("07:30");

    const existing = [
      {
        id: "s1",
        name: "7ª A",
        classLevel: "7ª Classe",
        academicYear: "2026/2027",
        roomNumber: "Sala 14",
        shift: "MORNING" as const,
        startTime: "07:30",
        endTime: "12:30",
      },
    ];

    expect(
      findConflictingRoomSection(
        {
          roomNumber: "  sala   14 ",
          academicYear: "2026/2027",
          shift: "MORNING",
          startTime: "08:00",
          endTime: "12:00",
        },
        existing,
      )?.section.id,
    ).toBe("s1");

    expect(
      findConflictingRoomSection(
        {
          roomNumber: "Sala 14",
          academicYear: "2026/2027",
          shift: "AFTERNOON",
          startTime: "13:00",
          endTime: "18:00",
        },
        existing,
      ),
    ).toBeNull();
  });
});

