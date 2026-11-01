import { discardOp, enqueue, failedOps, flushQueue, isNetworkError, pendingOps, readQueue, retryOp } from "@/lib/offline-queue";

const attendance = (items: Array<{ enrollment_id: string; status: string }>, url = "/s/sections/s1/subjects/ss1/attendance/2026-11-02") =>
  enqueue({ kind: "attendance", schoolId: "school-1", url, arrayKey: "records", items, label: "Chamada de 02/11/2026" });

const networkError = () => Object.assign(new Error("Network Error"), { isAxiosError: true, response: undefined });
const apiError = (status: number) => Object.assign(new Error("recusado"), { isAxiosError: true, response: { status } });

beforeEach(() => localStorage.clear());

describe("enqueue", () => {
  it("funde alterações ao mesmo destino por aluno: vale a mais recente", () => {
    attendance([{ enrollment_id: "a", status: "presente" }, { enrollment_id: "b", status: "presente" }]);
    attendance([{ enrollment_id: "b", status: "falta_injustificada" }, { enrollment_id: "c", status: "atraso" }]);

    const [op, ...rest] = readQueue();
    expect(rest).toHaveLength(0);
    expect(op.items).toEqual([
      { enrollment_id: "a", status: "presente" },
      { enrollment_id: "b", status: "falta_injustificada" },
      { enrollment_id: "c", status: "atraso" },
    ]);
  });

  it("destinos diferentes (outra data) ficam em operações separadas", () => {
    attendance([{ enrollment_id: "a", status: "presente" }]);
    attendance([{ enrollment_id: "a", status: "presente" }], "/s/sections/s1/subjects/ss1/attendance/2026-11-03");
    expect(readQueue()).toHaveLength(2);
  });

  it("não funde com uma operação que a API recusou: a nova segue sozinha", async () => {
    attendance([{ enrollment_id: "a", status: "presente" }]);
    await flushQueue("school-1", () => Promise.reject(apiError(409)), () => "pauta fechada");
    attendance([{ enrollment_id: "a", status: "atraso" }]);

    expect(readQueue()).toHaveLength(2);
    expect(pendingOps("school-1")).toHaveLength(1);
    expect(failedOps("school-1")).toHaveLength(1);
  });
});

describe("flushQueue", () => {
  it("envia por ordem e esvazia a fila", async () => {
    attendance([{ enrollment_id: "a", status: "presente" }], "/u1");
    attendance([{ enrollment_id: "a", status: "presente" }], "/u2");
    const sent: string[] = [];

    const r = await flushQueue("school-1", async (op) => void sent.push(op.url), () => "");

    expect(sent).toEqual(["/u1", "/u2"]);
    expect(r).toEqual({ sent: 2, failed: 0, pending: 0 });
    expect(readQueue()).toHaveLength(0);
  });

  it("pára à primeira falha de rede e mantém tudo o que falta (nada se perde)", async () => {
    attendance([{ enrollment_id: "a", status: "presente" }], "/u1");
    attendance([{ enrollment_id: "a", status: "presente" }], "/u2");
    attendance([{ enrollment_id: "a", status: "presente" }], "/u3");
    let calls = 0;

    const r = await flushQueue("school-1", async () => {
      if (++calls === 2) throw networkError();
    }, () => "");

    expect(r).toEqual({ sent: 1, failed: 0, pending: 2 });
    expect(pendingOps("school-1").map((o) => o.url)).toEqual(["/u2", "/u3"]);
  });

  it("uma recusa da API fica na fila com o motivo e não bloqueia as seguintes", async () => {
    attendance([{ enrollment_id: "a", status: "presente" }], "/u1");
    attendance([{ enrollment_id: "a", status: "presente" }], "/u2");

    const r = await flushQueue("school-1", async (op) => {
      if (op.url === "/u1") throw apiError(409);
    }, () => "A pauta está fechada.");

    expect(r).toEqual({ sent: 1, failed: 1, pending: 0 });
    const [bad] = failedOps("school-1");
    expect(bad).toMatchObject({ url: "/u1", error: "A pauta está fechada.", attempts: 1 });
  });

  it("só envia as alterações da escola ativa", async () => {
    enqueue({ kind: "grade", schoolId: "school-2", url: "/other", arrayKey: "grades", items: [{ enrollment_id: "x" }], label: "Notas" });
    attendance([{ enrollment_id: "a", status: "presente" }], "/mine");
    const sent: string[] = [];

    await flushQueue("school-1", async (op) => void sent.push(op.url), () => "");

    expect(sent).toEqual(["/mine"]);
    expect(readQueue().map((o) => o.url)).toEqual(["/other"]);
  });
});

describe("retryOp e discardOp", () => {
  it("tentar de novo volta a pôr a operação na fila de envio; descartar remove-a", async () => {
    attendance([{ enrollment_id: "a", status: "presente" }]);
    await flushQueue("school-1", () => Promise.reject(apiError(403)), () => "sem permissão");
    const [op] = failedOps("school-1");

    retryOp(op.id);
    expect(pendingOps("school-1")).toHaveLength(1);

    discardOp(op.id);
    expect(readQueue()).toHaveLength(0);
  });
});

describe("isNetworkError", () => {
  it("só conta quando não houve resposta do servidor", () => {
    expect(isNetworkError(networkError())).toBe(true);
    expect(isNetworkError(apiError(500))).toBe(false);
    expect(isNetworkError(new Error("outro"))).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});
