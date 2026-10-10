import { Role, MindSchoolRole, AppModule, PermissionAction } from "@/types";

/**
 * Standard Role Constants
 */
export const MINDSCHOOL_ROLES: readonly MindSchoolRole[] = [
  "DIRECTOR_GENERAL",
  "PEDAGOGIC_DIRECTOR",
  "SECRETARY",
  "TEACHER",
  "FINANCIAL",
  "GUARDIAN",
  "STUDENT",
  "SYSTEM_ADMIN",
  "MED_AUDITOR",
] as const;

export const ALL_ROLES: readonly Role[] = [
  ...MINDSCHOOL_ROLES,
  "ADMIN",
  "OWNER",
  "MANAGER",
] as const;

/**
 * Numerical rank for hierarchical comparisons.
 * Higher number = higher authority level.
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  DIRECTOR_GENERAL: 100,
  OWNER: 100,
  PEDAGOGIC_DIRECTOR: 90,
  FINANCIAL: 80,
  MANAGER: 80,
  SECRETARY: 70,
  TEACHER: 60,
  SYSTEM_ADMIN: 50,
  ADMIN: 50,
  MED_AUDITOR: 40,
  GUARDIAN: 20,
  STUDENT: 10,
};

/**
 * Roles requiring Mandatory Multi-Factor Authentication (2FA/MFA)
 * as specified in Notion Auth & Permissions guidelines.
 */
export const MFA_REQUIRED_ROLES: readonly Role[] = [
  "DIRECTOR_GENERAL",
  "PEDAGOGIC_DIRECTOR",
  "FINANCIAL",
  "SYSTEM_ADMIN",
  "ADMIN",
  "OWNER",
] as const;

/**
 * Staff and administrative roles authorized to enter the school management back-office.
 */
export const STAFF_ROLES: readonly Role[] = [
  "DIRECTOR_GENERAL",
  "PEDAGOGIC_DIRECTOR",
  "SECRETARY",
  "TEACHER",
  "FINANCIAL",
  "SYSTEM_ADMIN",
  "MED_AUDITOR",
  "OWNER",
  "ADMIN",
  "MANAGER",
] as const;

/**
 * Portal roles (Guardians and Students) with access to dedicated portals.
 */
export const PORTAL_ROLES: readonly Role[] = [
  "GUARDIAN",
  "STUDENT",
] as const;

/**
 * Executive and administrative direction roles.
 */
export const EXECUTIVE_ROLES: readonly Role[] = [
  "DIRECTOR_GENERAL",
  "PEDAGOGIC_DIRECTOR",
  "OWNER",
  "ADMIN",
] as const;

/**
 * Human-readable Portuguese labels for role display in badges, selectors, and profile headers.
 */
export const ROLE_LABELS: Record<Role, string> = {
  DIRECTOR_GENERAL: "Diretor Geral",
  PEDAGOGIC_DIRECTOR: "Diretor Pedagógico",
  SECRETARY: "Secretaria",
  TEACHER: "Professor",
  FINANCIAL: "Financeiro / Tesouraria",
  GUARDIAN: "Encarregado de Educação",
  STUDENT: "Aluno",
  SYSTEM_ADMIN: "Administrador de Sistema",
  MED_AUDITOR: "Auditor MED",
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MANAGER: "Direção Geral",
};

/**
 * Granular module permissions matrix by role as specified in Notion documentation.
 */
export const ROLE_MODULE_PERMISSIONS: Record<
  Role,
  Partial<Record<AppModule, readonly PermissionAction[]>>
> = {
  DIRECTOR_GENERAL: {
    dashboard: ["read", "export"],
    students: ["create", "read", "update", "delete", "export"],
    enrollments: ["create", "read", "update", "delete", "approve", "export"],
    guardians: ["create", "read", "update", "delete", "export"],
    academic: ["create", "read", "update", "delete", "approve", "export"],
    grades: ["read", "approve", "export"],
    grade_closing: ["approve", "read", "export"],
    dropout_risk: ["read", "export"],
    online_exams: ["read", "export"],
    tuition: ["create", "read", "update", "delete", "approve", "export"],
    teachers_attendance: ["read", "export"],
    certificates: ["read", "approve", "export"],
    med_reports: ["read", "export"],
    reports: ["read", "export"],
    settings: ["create", "read", "update", "delete"],
    plans: ["read", "update"],
  },
  PEDAGOGIC_DIRECTOR: {
    dashboard: ["read", "export"],
    students: ["create", "read", "update", "export"],
    enrollments: ["create", "read", "update", "approve", "export"],
    guardians: ["read", "export"],
    academic: ["create", "read", "update", "delete", "approve", "export"],
    grades: ["read", "approve", "export"],
    grade_closing: ["create", "read", "update", "approve", "export"], // Exclusive authority to close/reopen pautas
    dropout_risk: ["read", "export"],
    online_exams: ["create", "read", "update", "delete", "approve", "export"],
    teachers_attendance: ["create", "read", "update", "export"],
    certificates: ["read", "approve", "export"],
    med_reports: ["read", "approve", "export"],
    reports: ["read", "export"],
    settings: ["read", "update"],
  },
  SECRETARY: {
    dashboard: ["read"],
    students: ["create", "read", "update", "export"],
    enrollments: ["create", "read", "update", "export"],
    guardians: ["create", "read", "update", "export"],
    academic: ["read", "export"],
    grades: ["read", "export"],
    teachers_attendance: ["read", "export"],
    certificates: ["create", "read", "update", "export"],
    reports: ["read", "export"],
    settings: ["read"],
  },
  TEACHER: {
    academic: ["read"],
    grades: ["create", "read", "update"], // Continuous assessment (MAC/MAS) for assigned classes while pauta is open
    dropout_risk: ["read"],
    online_exams: ["create", "read", "update"],
    teachers_attendance: ["read"],
  },
  FINANCIAL: {
    dashboard: ["read"],
    students: ["read"], // View financial details
    tuition: ["create", "read", "update", "delete", "approve", "export"], // AGT invoicing, receipts, SAF-T (AO)
    reports: ["read", "export"],
    settings: ["read", "update"], // Tuition pricing table configuration
  },
  GUARDIAN: {
    students: ["read"], // View own ward(s)
    grades: ["read"],
    tuition: ["read"], // View and pay tuition
    certificates: ["create"], // Request certificates
  },
  STUDENT: {
    grades: ["read"], // View own grades and report cards
    online_exams: ["read"], // Participate in exams
    certificates: ["create"], // Request certificates
  },
  SYSTEM_ADMIN: {
    // Technical management: NO write access to grades or issuing financial invoices
    dashboard: ["read"],
    students: ["read", "update"],
    enrollments: ["read"],
    settings: ["create", "read", "update", "delete"],
    reports: ["read"],
  },
  MED_AUDITOR: {
    // Ministry of Education inspector: Read-only access to official maps and statistics (no PII)
    dashboard: ["read"],
    grades: ["read"],
    grade_closing: ["read"],
    med_reports: ["read", "export"],
    reports: ["read", "export"],
  },
  // Legacy aliases
  OWNER: {
    dashboard: ["read", "export"],
    students: ["create", "read", "update", "delete", "export"],
    enrollments: ["create", "read", "update", "delete", "approve", "export"],
    guardians: ["create", "read", "update", "delete", "export"],
    academic: ["create", "read", "update", "delete", "approve", "export"],
    grades: ["read", "approve", "export"],
    grade_closing: ["approve", "read", "export"],
    dropout_risk: ["read", "export"],
    online_exams: ["read", "export"],
    tuition: ["create", "read", "update", "delete", "approve", "export"],
    teachers_attendance: ["read", "export"],
    certificates: ["read", "approve", "export"],
    med_reports: ["read", "export"],
    reports: ["read", "export"],
    settings: ["create", "read", "update", "delete"],
    plans: ["read", "update"],
  },
  ADMIN: {
    dashboard: ["read"],
    settings: ["create", "read", "update", "delete"],
    reports: ["read"],
  },
  MANAGER: {
    dashboard: ["read", "export"],
    students: ["create", "read", "update", "export"],
    enrollments: ["create", "read", "update", "export"],
    guardians: ["create", "read", "update", "export"],
    academic: ["create", "read", "update", "export"],
    grades: ["read", "export"],
    tuition: ["read", "export"],
    reports: ["read", "export"],
  },
};

/**
 * Checks if a user has one of the allowed roles.
 */
export function hasRole(userRole: Role | undefined | null, allowedRoles?: readonly Role[]): boolean {
  if (!userRole) return false;
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
}

/**
 * Checks if a user role has permission to execute an action on a module.
 */
export function hasModulePermission(
  role: Role | undefined | null,
  module?: AppModule,
  action: PermissionAction = "read"
): boolean {
  if (!role) return false;
  if (!module) return true;
  const permissions = ROLE_MODULE_PERMISSIONS[role]?.[module];
  if (!permissions) return false;
  return permissions.includes(action);
}

/**
 * Returns human-readable label for a role.
 */
export function getRoleLabel(role: Role): string {
  return ROLE_LABELS[role] || role;
}

