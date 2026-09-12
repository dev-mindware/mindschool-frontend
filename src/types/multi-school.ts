export interface SchoolUnitSummary {
  id: string;
  name: string; // Ex: "Complexo Escolar MindSchool - Talatona"
  code: string; // Ex: "MS-TALATONA"
  province: string; // Ex: "Luanda"
  municipality: string; // Ex: "Talatona"
  address: string;
  directorName: string;
  totalStudents: number;
  totalTeachers: number;
  totalSections: number;
  attendanceRatePercentage: number;
  passRatePercentage: number;
  dropoutRiskCount: number;
  capacityUtilizationPercentage: number;
  activeStatus: 'ACTIVE' | 'MAINTENANCE';
}

export interface MultiSchoolMetrics {
  totalUnits: number;
  networkTotalStudents: number;
  networkTotalTeachers: number;
  averagePassRate: number;
  averageAttendanceRate: number;
  totalHighRiskStudents: number;
}
