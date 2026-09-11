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
      roles: ["MANAGER", "OWNER"],
      minPlan: "Base",
    },
    /*   {
      name: "GestIA",
      url: "/gestia",
      icon: <Icon name="Sparkles" className="w-5 h-5" />,
      roles: ["OWNER"],
      minPlan: "Base",
      showUpgrade: true,
    }, */
    {
      name: "Planos",
      url: "/plans",
      icon: <Icon name="Wallet" className="w-5 h-5" />,
      roles: ["OWNER"],
      minPlan: "Base",
    },
    {
      name: "Clientes",
      url: "/clients",
      icon: <Icon name="Users" className="w-5 h-5" />,
      roles: ["MANAGER", "OWNER"],
      minPlan: "Base",
    },
    {
      name: "Documentos",
      url: "/documents",
      icon: <Icon name="ScrollText" className="w-5 h-5" />,
      roles: ["MANAGER", "OWNER"],
      minPlan: "Base",
    },
    {
      name: "Items",
      url: "/items",
      icon: <Icon name="ShoppingBasket" className="w-5 h-5" />,
      roles: ["MANAGER", "OWNER"],
      minPlan: "Base",
    },
    {
      name: "Fornecedores",
      url: "/suppliers",
      icon: <Icon name="Truck" className="w-5 h-5" />,
      roles: ["MANAGER", "OWNER"],
      minPlan: "Pro",
    },
    {
      name: "Gestão",
      url: "#",
      icon: <Icon name="Boxes" className="w-5 h-5" />,
      roles: ["MANAGER", "OWNER"],
      minPlan: "Smart",
      items: [
        {
          name: "Stock",
          url: "/management/stock",
        },
        {
          name: "Reservas",
          url: "/management/reservation",
          minPlan: "Pro",
        },
        {
          name: "POS",
          url: "/management/pos",
          minPlan: "Pro",
        },
      ],
    },
    {
      name: "Relatórios",
      url: "#",
      icon: <Icon name="ChartNetwork" className="w-5 h-5" />,
      roles: ["OWNER", "MANAGER"],
      minPlan: "Base",
      items: [
        {
          name: "Vendas e Facturação",
          url: "/reports/sales",
        },
        {
          name: "Clientes",
          url: "/reports/clients",
          minPlan: "Smart",
        },
        {
          name: "Acesso e Auditoria",
          url: "/reports/access-control",
          minPlan: "Pro",
        },
      ],
    },
    {
      name: "Notificações",
      url: "/notifications",
      icon: <Icon name="Bell" className="w-5 h-5" />,
      roles: ["MANAGER", "OWNER"],
      minPlan: "Base",
    },
    {
      name: "Configurações",
      url: "/settings",
      icon: <Icon name="Settings" className="w-5 h-5" />,
      roles: ["MANAGER", "OWNER"],
      minPlan: "Base",
    },
    {
      name: "Ponto de Venda",
      url: "/pos/counter",
      icon: <Icon name="Computer" className="w-5 h-5" />,
      roles: ["CASHIER", "OWNER", "MANAGER"],
      minPlan: "Smart",
    },
    {
      name: "Movimentações",
      url: "/pos/movements",
      icon: <Icon name="Wallet" className="w-5 h-5" />,
      roles: ["CASHIER", "OWNER", "MANAGER"],
      minPlan: "Smart",
    },
    {
      name: "Notificações",
      url: "/pos/notifications",
      icon: <Icon name="Bell" className="w-5 h-5" />,
      roles: ["CASHIER", "OWNER", "MANAGER"],
      minPlan: "Smart",
    },
    {
      name: "Configurações",
      url: "/pos/settings",
      icon: <Icon name="Settings" className="w-5 h-5" />,
      roles: ["CASHIER", "OWNER", "MANAGER"],
      minPlan: "Smart",
    },
  ],
};
