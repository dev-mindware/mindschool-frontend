import { clearStepUp, completeStepUp, getStepUpToken, isStepUpRequired, requestStepUp, STEP_UP_REQUEST_EVENT, type StepUpRequest } from "@/lib/step-up";

describe("step-up (reautenticação)", () => {
  beforeEach(() => clearStepUp());

  it("o token vale até expirar (com margem de segurança)", () => {
    expect(getStepUpToken(1_000)).toBeNull();
    completeStepUp("tok", 60, 1_000); // expira em 61 000 ms
    expect(getStepUpToken(2_000)).toBe("tok");
    expect(getStepUpToken(55_000)).toBe("tok");
    expect(getStepUpToken(57_000)).toBeNull(); // dentro da margem de 5 s
    expect(getStepUpToken(70_000)).toBeNull();
  });

  it("reconhece o erro STEP_UP_REQUIRED da API", () => {
    expect(isStepUpRequired({ code: "STEP_UP_REQUIRED" })).toBe(true);
    expect(isStepUpRequired({ code: "FORBIDDEN" })).toBe(false);
    expect(isStepUpRequired(null)).toBe(false);
    expect(isStepUpRequired("x")).toBe(false);
  });

  it("vários pedidos em simultâneo abrem uma só janela e partilham o resultado", async () => {
    const seen: StepUpRequest[] = [];
    const on = (e: Event) => seen.push((e as CustomEvent<StepUpRequest>).detail);
    window.addEventListener(STEP_UP_REQUEST_EVENT, on);
    const a = requestStepUp();
    const b = requestStepUp();
    expect(seen).toHaveLength(1);
    seen[0]!.resolve("abc");
    await expect(Promise.all([a, b])).resolves.toEqual(["abc", "abc"]);
    window.removeEventListener(STEP_UP_REQUEST_EVENT, on);
  });

  it("cancelar rejeita o pedido e permite voltar a pedir", async () => {
    const seen: StepUpRequest[] = [];
    const on = (e: Event) => seen.push((e as CustomEvent<StepUpRequest>).detail);
    window.addEventListener(STEP_UP_REQUEST_EVENT, on);
    const a = requestStepUp();
    seen[0]!.reject(new Error("cancelado"));
    await expect(a).rejects.toThrow("cancelado");
    void requestStepUp().catch(() => undefined);
    expect(seen).toHaveLength(2);
    window.removeEventListener(STEP_UP_REQUEST_EVENT, on);
  });
});
