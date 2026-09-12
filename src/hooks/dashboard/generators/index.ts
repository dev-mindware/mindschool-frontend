import { Role, RoleDashboardData } from "@/types";
import { buildDirectorData } from "./director-data";
import { buildPedagogicData } from "./pedagogic-data";
import { buildTeacherData } from "./teacher-data";
import { buildSecretaryData } from "./secretary-data";
import { buildFinancialData } from "./financial-data";
import { buildMedAuditorData } from "./med-auditor-data";
import { buildGuardianData } from "./guardian-data";

export function generateRoleDashboardData(
  role: Role,
  period: string,
  academicYear: string
): RoleDashboardData {
  switch (role) {
    case "PEDAGOGIC_DIRECTOR":
      return buildPedagogicData(role, period, academicYear);
    case "TEACHER":
      return buildTeacherData(role, period, academicYear);
    case "SECRETARY":
      return buildSecretaryData(role, period, academicYear);
    case "FINANCIAL":
    case "CASHIER":
      return buildFinancialData(role, period, academicYear);
    case "MED_AUDITOR":
      return buildMedAuditorData(role, period, academicYear);
    case "GUARDIAN":
    case "STUDENT":
      return buildGuardianData(role, period, academicYear);
    case "DIRECTOR_GENERAL":
    case "SYSTEM_ADMIN":
    case "OWNER":
    case "ADMIN":
    case "MANAGER":
    default:
      return buildDirectorData(role, period, academicYear);
  }
}

export {
  buildDirectorData,
  buildPedagogicData,
  buildTeacherData,
  buildSecretaryData,
  buildFinancialData,
  buildMedAuditorData,
  buildGuardianData,
};
