import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { LoginInteractiveShell } from "../login-interactive-shell";

const mockLoginAction = jest.fn();

jest.mock("@/actions/login", () => ({
  loginAction: (...args: unknown[]) => mockLoginAction(...args),
}));

jest.mock("@/utils/messages", () => ({
  ErrorMessage: jest.fn(),
}));

jest.mock("@/components/common/logo/mindschool-logo", () => ({
  MindSchoolLogo: () => <span data-testid="mindschool-logo" />,
}));

describe("LoginInteractiveShell", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockLoginAction.mockReset();
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renderiza diretamente em ecrã inteiro sem splash bloqueante e inicia a entrada das figuras", () => {
    render(<LoginInteractiveShell />);

    expect(screen.queryByTestId("login-opening-splash")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("exemplo@escola.ao")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••••••")).toHaveAttribute("type", "password");

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const scene = screen.getByTestId("login-characters-scene");
    expect(scene).toHaveAttribute("data-entered", "true");
  });

  it("reage ao foco no email e desvia o olhar quando a palavra-passe é revelada", () => {
    render(<LoginInteractiveShell />);

    const scene = screen.getByTestId("login-characters-scene");
    const emailInput = screen.getByPlaceholderText("exemplo@escola.ao");

    fireEvent.focus(emailInput);
    expect(scene).toHaveAttribute("data-focus-target", "email");
    expect(scene).toHaveAttribute("data-scene-state", "curious");

    const toggleEye = screen.getByRole("button", { name: "Mostrar palavra-passe" });
    fireEvent.click(toggleEye);

    expect(scene).toHaveAttribute("data-password-visible", "true");
    expect(scene).toHaveAttribute("data-scene-state", "shy");

    const hideEye = screen.getByRole("button", { name: "Ocultar palavra-passe" });
    fireEvent.click(hideEye);

    expect(scene).toHaveAttribute("data-password-visible", "false");
  });

  it("exibe reação de erro quando as credenciais falham", async () => {
    mockLoginAction.mockResolvedValue({
      user: null,
      redirectPath: "/auth/login",
      message: "Credenciais inválidas.",
    });

    render(<LoginInteractiveShell />);

    const emailInput = screen.getByPlaceholderText("exemplo@escola.ao");
    const passwordInput = screen.getByPlaceholderText("••••••••••••");
    const submitBtn = screen.getByRole("button", { name: "Entrar" });

    fireEvent.change(emailInput, { target: { value: "direccao@escola.ao" } });
    fireEvent.change(passwordInput, { target: { value: "SenhaErrada123!" } });

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    const scene = screen.getByTestId("login-characters-scene");
    await waitFor(() => {
      expect(scene).toHaveAttribute("data-reaction", "error");
      expect(scene).toHaveAttribute("data-scene-state", "error");
    });

    act(() => {
      jest.advanceTimersByTime(1900);
    });
    expect(scene).toHaveAttribute("data-reaction", "idle");
  });

  it("respeita prefers-reduced-motion", () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<LoginInteractiveShell />);
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId("login-characters-scene")).toHaveAttribute("data-entered", "true");
  });
});
