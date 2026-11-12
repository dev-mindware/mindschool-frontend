/** @jest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MobileModuleNavbar } from "@/components/templates/global-sidebar/mobile-module-navbar";
import { menuItems } from "@/constants/menu-items";
import { activeModule, buildNavigation } from "@/constants/navigation";
import { getSidebarForUser } from "@/lib/get-sidebar-for-user";
import type { Role } from "@/types";

const push = jest.fn();
let currentPathname = "/dashboard";
let currentRole: Role = "DIRECTOR_GENERAL";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("@/components", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

jest.mock("@/components/common/icon", () => ({
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

jest.mock("@/hooks/common/use-navigation", () => ({
  useNavigation: () => {
    const items = getSidebarForUser(menuItems.items, currentRole, undefined);
    const model = buildNavigation(items);
    return {
      ready: true,
      items,
      model,
      active: activeModule(model, currentPathname),
      pathname: currentPathname,
    };
  },
}));

describe("MobileModuleNavbar", () => {
  beforeEach(() => {
    push.mockClear();
    currentPathname = "/dashboard";
    currentRole = "DIRECTOR_GENERAL";
  });

  it("apresenta 4 módulos por omissão e destaca o módulo activo com ícone e nome", () => {
    render(<MobileModuleNavbar />);

    const inicioBtn = screen.getByRole("button", { name: "Início" });
    expect(inicioBtn.getAttribute("aria-current")).toBe("page");
    expect(inicioBtn.textContent).toContain("Início");

    expect(screen.getByRole("button", { name: "Secretaria" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Académico" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Avaliação" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mostrar todos os módulos" })).toBeTruthy();
  });

  it("abre o painel de subpáginas ao clicar num módulo com várias páginas e destaca a página activa", () => {
    currentPathname = "/academic/classes";
    render(<MobileModuleNavbar />);

    const academicoBtn = screen.getByRole("button", { name: "Académico" });
    fireEvent.click(academicoBtn);

    expect(screen.getByRole("region", { name: "Páginas do módulo Académico" })).toBeTruthy();
    const turmasLink = screen.getByRole("link", { name: /Turmas/i });
    expect(turmasLink.getAttribute("aria-current")).toBe("page");
  });

  it("navega directamente quando o módulo tem uma única página (ex.: Início ou Configurações)", () => {
    currentPathname = "/academic/classes";
    render(<MobileModuleNavbar />);

    fireEvent.click(screen.getByRole("button", { name: "Início" }));
    expect(push).toHaveBeenCalledWith("/dashboard");
  });

  it("expande e recolhe para revelar todos os módulos disponíveis ao clicar no botão da seta", () => {
    render(<MobileModuleNavbar />);

    const expandBtn = screen.getByRole("button", { name: "Mostrar todos os módulos" });
    fireEvent.click(expandBtn);

    expect(screen.getByRole("region", { name: "Todos os módulos" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Financeiro/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Relatórios/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Configurações/i })).toBeTruthy();

    const collapseBtn = screen.getByRole("button", { name: "Recolher módulos" });
    fireEvent.click(collapseBtn);

    expect(screen.queryByRole("region", { name: "Todos os módulos" })).toBeNull();
  });

  it("oculta o botão de expansão quando o papel possui 4 ou menos módulos (ex.: GUARDIAN)", () => {
    currentRole = "GUARDIAN";
    currentPathname = "/family/timetable";
    render(<MobileModuleNavbar />);

    expect(screen.getByRole("button", { name: "Acompanhamento" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Serviços" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Conta" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Mostrar todos os módulos" })).toBeNull();
  });
});
