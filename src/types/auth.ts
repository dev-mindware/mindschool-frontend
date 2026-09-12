import { Company, Store } from "./company";
import type { Subscription } from "./subscription";

export interface LoginResponse {
  message: string;
  user: User;
  tokens: Tokens;
}

export type MindSchoolRole =
  | "DIRECTOR_GENERAL"
  | "PEDAGOGIC_DIRECTOR"
  | "SECRETARY"
  | "TEACHER"
  | "FINANCIAL"
  | "GUARDIAN"
  | "STUDENT"
  | "SYSTEM_ADMIN"
  | "MED_AUDITOR";

export type LegacyRole = "ADMIN" | "OWNER" | "MANAGER" | "CASHIER";

export type Role = MindSchoolRole | LegacyRole;

export interface UserSchoolRole {
  id: string;
  userId: string;
  schoolId: string;
  role: Role;
  isPrimary: boolean;
}

export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "export";

export type AppModule =
  | "dashboard"
  | "students"
  | "enrollments"
  | "guardians"
  | "academic"
  | "grades"
  | "grade_closing"
  | "dropout_risk"
  | "online_exams"
  | "tuition"
  | "teachers_attendance"
  | "certificates"
  | "med_reports"
  | "reports"
  | "settings"
  | "plans";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string,
  barcode?: string | null;
  company: Company;
  store?: Store;
  subscription?: Subscription;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}