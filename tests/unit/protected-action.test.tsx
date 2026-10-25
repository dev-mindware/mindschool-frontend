/** @jest-environment jsdom */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProtectedAction } from "@/components/guards/protected-action";
import { SubscriptionStatus } from "@/types";

const openModal = jest.fn();
let status: SubscriptionStatus | undefined;

jest.mock("@/stores", () => ({
  useAuthStore: () => ({ user: { company: { subscription: status ? { status } : undefined } } }),
  useModal: () => ({ openModal }),
}));

const clique = () => {
  const acao = jest.fn();
  render(<ProtectedAction><button onClick={acao}>Abrir</button></ProtectedAction>);
  fireEvent.click(screen.getByText("Abrir"));
  return acao;
};

describe("ProtectedAction", () => {
  beforeEach(() => openModal.mockClear());

  it("subscrição ativa: a ação corre", () => {
    status = SubscriptionStatus.ACTIVE;
    expect(clique()).toHaveBeenCalled();
    expect(openModal).not.toHaveBeenCalled();
  });

  it("estado desconhecido (encarregado/aluno): a ação corre, sem «Subscrição Expirada»", () => {
    status = undefined;
    expect(clique()).toHaveBeenCalled();
    expect(openModal).not.toHaveBeenCalled();
  });

  it("subscrição expirada conhecida: bloqueia e abre o aviso", () => {
    status = SubscriptionStatus.EXPIRED;
    expect(clique()).not.toHaveBeenCalled();
    expect(openModal).toHaveBeenCalledWith("subscription-expired-modal");
  });
});
