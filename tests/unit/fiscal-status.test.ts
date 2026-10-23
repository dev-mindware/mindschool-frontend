import { FISCAL_STATUS } from "../../src/modules/finance/settlement-model";

describe("Estados fiscais", () => {
  it("cobre todos os estados da API, incluindo a emissão em pausa", () => {
    for (const s of ["sem_ligacao", "sem_catalogo", "pausada", "pendente_fiscal", "certificada", "rejeitada", "erro", "sem_submissao"] as const) {
      expect(FISCAL_STATUS[s].label).toBeTruthy();
      expect(FISCAL_STATUS[s].hint).toBeTruthy();
    }
    expect(FISCAL_STATUS.pausada.hint).toMatch(/reactivad/);
  });
});
