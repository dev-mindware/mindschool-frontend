import { Icon } from "@/components";
import { Role, PlanType } from "@/types";

type SubMenuItem = {
  name: string;
  url: string;
  roles?: Role[];
  minPlan?: PlanType;
};

export type MenuItem = {
  name: string;
  url: string;
  icon?: React.ReactNode;
  roles?: Role[];
  minPlan?: PlanType;
  showMoreIcon?: boolean;
  showUpgrade?: boolean;
  items?: SubMenuItem[];
};

export type MenuStructure = {
  items: MenuItem[];
};

export const menuItems: MenuStructure = {
  items: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <Icon name="LayoutDashboard" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "FINANCIAL",
        "SECRETARY",
        "SYSTEM_ADMIN",
        "MED_AUDITOR",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
    },
    {
      name: "Alunos & Matrículas",
      url: "#",
      icon: <Icon name="GraduationCap" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "SECRETARY",
        "FINANCIAL",
        "SYSTEM_ADMIN",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
      items: [
        {
          name: "Candidaturas",
          url: "/students/admissions",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "FINANCIAL",
            "SYSTEM_ADMIN",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Alunos",
          url: "/students/list",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "FINANCIAL",
            "SYSTEM_ADMIN",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Matrículas",
          url: "/students/enrollments",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "SYSTEM_ADMIN",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Encarregados",
          url: "/students/guardians",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
      ],
    },
    {
      name: "Gestão Académica",
      url: "#",
      icon: <Icon name="School" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "SECRETARY",
        "TEACHER",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
      items: [
        {
          name: "Turmas",
          url: "/academic/classes",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "TEACHER",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Disciplinas",
          url: "/academic/subjects",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Professores",
          url: "/academic/assignments",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Horários",
          url: "/academic/timetables",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "TEACHER",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Faltas & Disciplina",
          url: "/academic/attendance",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "TEACHER",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Biblioteca Escolar",
          url: "/academic/library",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "TEACHER",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Saúde & Psicopedagogia",
          url: "/academic/health-psychology",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "TEACHER",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Transporte Escolar",
          url: "/academic/transport",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "TEACHER",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Actividades Extracurriculares",
          url: "/academic/extracurricular",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "TEACHER",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
      ],
    },
    {
      name: "Avaliações & Pautas",
      url: "#",
      icon: <Icon name="BookOpenCheck" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "TEACHER",
        "SECRETARY",
        "MED_AUDITOR",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
      items: [
        {
          name: "Lançamento de Notas",
          url: "/grades/entry",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "TEACHER",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Pautas Trimestrais",
          url: "/grades/pautas",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "MED_AUDITOR",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Transições de Classe",
          url: "/grades/transitions",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
      ],
    },
    {
      name: "Alerta de Risco",
      url: "/dropout-risk",
      icon: <Icon name="TriangleAlert" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "TEACHER",
        "SECRETARY",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Smart",
    },
    {
      name: "Provas Online",
      url: "/online-exams",
      icon: <Icon name="FileSpreadsheet" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "TEACHER",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Pro",
    },
    {
      name: "Propinas & Finanças",
      url: "#",
      icon: <Icon name="BadgePercent" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "FINANCIAL",
        "SECRETARY",
        "OWNER",
        "MANAGER",
        "ADMIN",
        "CASHIER",
      ],
      minPlan: "Base",
      items: [
        {
          name: "Propinas",
          url: "/tuition/payments",
          roles: [
            "DIRECTOR_GENERAL",
            "FINANCIAL",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
            "CASHIER",
          ],
        },
        {
          name: "Facturas & Recibos",
          url: "/tuition/invoices",
          roles: [
            "DIRECTOR_GENERAL",
            "FINANCIAL",
            "OWNER",
            "MANAGER",
            "ADMIN",
            "CASHIER",
          ],
        },
        {
          name: "Cobrança WhatsApp",
          url: "/tuition/collections",
          roles: [
            "DIRECTOR_GENERAL",
            "FINANCIAL",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
          minPlan: "Smart",
        },
        {
          name: "Tabelas de Preço",
          url: "/tuition/plans",
          roles: [
            "DIRECTOR_GENERAL",
            "FINANCIAL",
            "OWNER",
            "ADMIN",
          ],
        },
      ],
    },
    {
      name: "Assiduidade Docente",
      url: "/teachers-attendance",
      icon: <Icon name="QrCode" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "SECRETARY",
        "TEACHER",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Smart",
    },
    {
      name: "Documentos Oficiais",
      url: "#",
      icon: <Icon name="FileText" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "SECRETARY",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
      items: [
        {
          name: "Declarações",
          url: "/certificates/declarations",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Boletins de Notas",
          url: "/certificates/report-cards",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "Secretaria & Protocolo",
          url: "/certificates/requests",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
      ],
    },
    {
      name: "Comunicação & Circulares",
      url: "/communication/circulars",
      icon: <Icon name="Megaphone" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "SECRETARY",
        "TEACHER",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
    },
    {
      name: "Relatórios & MED",
      url: "#",
      icon: <Icon name="ChartBar" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "SECRETARY",
        "FINANCIAL",
        "MED_AUDITOR",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
      items: [
        {
          name: "Mapas do MED",
          url: "/reports/med",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "MED_AUDITOR",
            "OWNER",
            "ADMIN",
          ],
        },
        {
          name: "Rendimento",
          url: "/reports/academic",
          roles: [
            "DIRECTOR_GENERAL",
            "PEDAGOGIC_DIRECTOR",
            "SECRETARY",
            "MED_AUDITOR",
            "OWNER",
            "MANAGER",
            "ADMIN",
          ],
        },
        {
          name: "SAF-T Escolar",
          url: "/reports/finance",
          roles: [
            "DIRECTOR_GENERAL",
            "FINANCIAL",
            "OWNER",
            "ADMIN",
          ],
        },
        {
          name: "Multi-Escola",
          url: "/reports/multi-school",
          roles: [
            "DIRECTOR_GENERAL",
            "OWNER",
            "ADMIN",
          ],
          minPlan: "Pro",
        },
      ],
    },
    {
      name: "Planos",
      url: "/plans",
      icon: <Icon name="Wallet" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "OWNER",
        "ADMIN",
      ],
      minPlan: "Base",
    },
    {
      name: "Configurações",
      url: "/settings",
      icon: <Icon name="Settings" className="w-5 h-5" />,
      roles: [
        "DIRECTOR_GENERAL",
        "PEDAGOGIC_DIRECTOR",
        "FINANCIAL",
        "SECRETARY",
        "SYSTEM_ADMIN",
        "OWNER",
        "MANAGER",
        "ADMIN",
      ],
      minPlan: "Base",
    },
  ],
};
