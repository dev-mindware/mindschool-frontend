export type AttendanceRecordType = 'CHECK_IN' | 'CHECK_OUT';

export type AttendanceMethod = 'QR_DYNAMIC_APP' | 'QR_STATIC_CARD' | 'MANUAL_SUPERVISOR';

export type TeacherDayStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'JUSTIFIED_ABSENCE' | 'ON_DUTY';

export interface TeacherAttendanceLog {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  durationMinutes?: number;
  status: TeacherDayStatus;
  checkInMethod?: AttendanceMethod;
  checkOutMethod?: AttendanceMethod;
  terminalId?: string;
  scheduledClassesCount: number;
  completedClassesCount: number;
  delayMinutes?: number;
  justificationReason?: string;
  justificationDocument?: string;
}

export interface TeacherQrCredential {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  staticCardQr: string;
  dynamicAppToken?: string;
  dynamicTokenExpiresAt?: string;
  isCardPrinted: boolean;
  issuedAt: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface TeacherAttendanceMetrics {
  totalTeachers: number;
  presentToday: number;
  absentToday: number;
  lateArrivalsToday: number;
  punctualityRatePercentage: number;
  classesFulfillmentPercentage: number;
}
