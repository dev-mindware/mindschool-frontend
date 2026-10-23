import { FISCAL_STATUS, settlementBody } from "../../src/modules/finance/settlement-model";

describe("liquidação (marcar como pago)", () => {
  it("monta o corpo com as cobranças, o método da API e o cliente escolhido", () => {
    expect(settlementBody({ invoiceIds: ["a", "b"], method: "CASH" })).toEqual({ invoice_ids: ["a", "b"], method: "numerario" });
    expect(settlementBody({ invoiceIds: ["a"], method: "MULTICAIXA", reference: "MCX-1", customer: { kind: "encarregado", guardianId: "g1" } })).toEqual({
      invoice_ids: ["a"], method: "multicaixa_express", reference_code: "MCX-1", customer: { kind: "encarregado", guardian_id: "g1" },
    });
    expect(settlementBody({ invoiceIds: ["a"], method: "TRANSFER", customer: { kind: "consumidor_final" } }).customer).toEqual({ kind: "consumidor_final" });
  });

  it("corta a referência ao limite da API", () => {
    expect(settlementBody({ invoiceIds: ["a"], method: "EXPRESS", reference: "x".repeat(80) }).reference_code).toHaveLength(50);
  });

  it("todos os estados fiscais têm rótulo e explicação (e nenhum diz «estorno»)", () => {
    for (const s of Object.values(FISCAL_STATUS)) {
      expect(s.label.length).toBeGreaterThan(2);
      expect(s.hint.length).toBeGreaterThan(10);
      expect(`${s.label} ${s.hint}`.toLowerCase()).not.toContain("estorn");
    }
  });
});
