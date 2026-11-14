import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AuthInteractiveShell } from "../auth-interactive-shell";
import { RecoveryPassword } from "../../forgot-password/recovery-password";
import { ResetPassword } from "../../reset-password/reset-password";

const mockForgotMutateAsync = jest.fn();
const mockResetPasswordAndLoginAction = jest.fn();
const mockOpenModal = jest.fn();
let mockToken: string | null = "valid-reset-token";

jest.mock("@/hooks/auth", () => ({
  useForgotPassword: () => ({
    mutateAsync: (...args: unknown[]) => mockForgotMutateAsync(...args),
    isPending: false,
  }),
}));

jest.mock("@/actions/login", () => ({
  resetPasswordAndLoginAction: (...args: unknown[]) => mockResetPasswordAndLoginAction(...args),
}));

jest.mock("@/stores/modal/use-modal-store", () => ({
  useModal: () => ({ openModal: mockOpenModal, closeModal: jest.fn() }),
}));

jest.mock("@/stores", () => ({
  useModal: () => ({ openModal: mockOpenModal, closeModal: jest.fn() }),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? mockToken : null),
  }),
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@/utils/messages", () => ({
  ErrorMessage: jest.fn(),
}));

jest.mock("@/components/common/logo/mindschool-logo", () => ({
  MindSchoolLogo: () => <span data-testid="mindschool-logo" />,
}));

jest.mock("../../forgot-password/otp-modal", () => ({
  OTPModal: () => null,
}));

jest.mock("../../reset-password/success-reset-modal", () => ({
  SuccessResetModal: () => null,
}));

describe("AuthInteractiveShell com ecrãs de recuperação e redefinição", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockForgotMutateAsync.mockReset();
    mockResetPasswordAndLoginAction.mockReset();
    mockOpenModal.mockReset();
    mockToken = "valid-reset-token";
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

  it("liga RecoveryPassword ao palco 2D (entrada, foco no email e reação de erro)", async () => {
    mockForgotMutateAsync.mockRejectedValue(new Error("Falha no envio"));

    render(
      <AuthInteractiveShell
        title="Acesso seguro e recuperação protegida."
        subtitle="Subtítulo de teste."
      >
        <RecoveryPassword />
      </AuthInteractiveShell>,
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const scene = screen.getByTestId("login-characters-scene");
    expect(scene).toHaveAttribute("data-entered", "true");

    const emailInput = screen.getByPlaceholderText("exemplo@escola.ao");
    fireEvent.focus(emailInput);
    expect(scene).toHaveAttribute("data-focus-target", "email");
    expect(scene).toHaveAttribute("data-scene-state", "curious");

    fireEvent.change(emailInput, { target: { value: "direccao@escola.ao" } });
    const submitBtn = screen.getByRole("button", { name: "Verificar Email" });
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(scene).toHaveAttribute("data-reaction", "error");
      expect(scene).toHaveAttribute("data-scene-state", "error");
    });

    act(() => {
      jest.advanceTimersByTime(1900);
    });
    expect(scene).toHaveAttribute("data-reaction", "idle");
  });

  it("liga ResetPassword ao palco 2D e mantém o estado tímido enquanto qualquer senha estiver visível", async () => {
    mockToken = null;

    render(
      <AuthInteractiveShell
        title="Credenciais fortes e protegidas."
        subtitle="Subtítulo de teste."
      >
        <ResetPassword />
      </AuthInteractiveShell>,
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const scene = screen.getByTestId("login-characters-scene");
    expect(scene).toHaveAttribute("data-entered", "true");

    const newPassInput = screen.getByPlaceholderText("Introduza a nova palavra-passe");
    const confirmPassInput = screen.getByPlaceholderText("Confirme a nova palavra-passe");

    fireEvent.focus(newPassInput);
    expect(scene).toHaveAttribute("data-focus-target", "password");

    const showButtons = screen.getAllByRole("button", { name: "Mostrar palavra-passe" });
    expect(showButtons).toHaveLength(2);

    // Revelar a segunda palavra-passe ativa o estado tímido
    fireEvent.click(showButtons[1]);
    expect(scene).toHaveAttribute("data-password-visible", "true");
    expect(scene).toHaveAttribute("data-scene-state", "shy");

    // Revelar também a primeira mantém o estado tímido mesmo após ocultar uma delas
    fireEvent.click(showButtons[0]);
    const hideButtonsAfterBoth = screen.getAllByRole("button", { name: "Ocultar palavra-passe" });
    expect(hideButtonsAfterBoth).toHaveLength(2);

    fireEvent.click(hideButtonsAfterBoth[0]);
    expect(scene).toHaveAttribute("data-password-visible", "true");

    const remainingHide = screen.getByRole("button", { name: "Ocultar palavra-passe" });
    fireEvent.click(remainingHide);
    expect(scene).toHaveAttribute("data-password-visible", "false");

    fireEvent.change(newPassInput, { target: { value: "SenhaForte123!" } });
    fireEvent.change(confirmPassInput, { target: { value: "SenhaForte123!" } });

    const submitBtn = screen.getByRole("button", { name: "Confirmar e Concluir" });
    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(scene).toHaveAttribute("data-reaction", "error");
      expect(scene).toHaveAttribute("data-scene-state", "error");
    });
  });
});

