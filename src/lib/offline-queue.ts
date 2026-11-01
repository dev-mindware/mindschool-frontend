/**
 * Fila de alterações sem ligação (chamada e notas).
 *
 * Cada alteração é um PUT idempotente da API: repetir o mesmo valor não muda nada (as notas são versionadas e auditadas,
 * a chamada só regista o que mudou). Por isso o reenvio é seguro: se a rede cai a meio, o pior caso é enviar duas vezes
 * o mesmo valor. Duas alterações ao mesmo aluno fundem-se (vale a última). Se a API recusar (pauta fechada, sem permissão,
 * dado inválido), a alteração não se perde nem se repete: fica na fila com o motivo para a pessoa decidir.
 */

const STORAGE_KEY = "mindschool.offline-queue.v1";
export const QUEUE_EVENT = "offline-queue:changed";

export type QueuedKind = "attendance" | "grade";

export interface QueuedItem {
  enrollment_id: string;
  [field: string]: unknown;
}

export interface QueuedOp {
  id: string;
  kind: QueuedKind;
  schoolId: string;
  /** Caminho da API relativo ao cliente (`/s/...`), o mesmo que o pedido normal usaria. */
  url: string;
  /** Propriedade do corpo que leva a lista de itens. */
  arrayKey: "records" | "grades";
  items: QueuedItem[];
  label: string;
  createdAt: string;
  attempts: number;
  /** Preenchido quando a API recusou: a alteração fica à espera de decisão. */
  error?: string;
}

export type NewOp = Pick<QueuedOp, "kind" | "schoolId" | "url" | "arrayKey" | "items" | "label">;

const newId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export function readQueue(): QueuedOp[] {
  try {
    const raw = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOp[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(ops: QueuedOp[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ops));
  } catch {
    // Sem armazenamento (modo privado ou cheio): a alteração perde-se só se a página fechar; nada mais a fazer aqui.
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(QUEUE_EVENT));
}

/** Acrescenta uma alteração; se já há uma por enviar para o mesmo destino, funde-as por aluno (vale a mais recente). */
export function enqueue(op: NewOp): void {
  const ops = readQueue();
  const target = ops.find((o) => !o.error && o.schoolId === op.schoolId && o.url === op.url && o.arrayKey === op.arrayKey);
  if (target) {
    const byId = new Map(target.items.map((i) => [i.enrollment_id, i]));
    for (const item of op.items) byId.set(item.enrollment_id, item);
    target.items = [...byId.values()];
    target.label = op.label;
  } else {
    ops.push({ ...op, id: newId(), createdAt: new Date().toISOString(), attempts: 0 });
  }
  writeQueue(ops);
}

export const pendingOps = (schoolId: string | null): QueuedOp[] => readQueue().filter((o) => o.schoolId === schoolId && !o.error);
export const failedOps = (schoolId: string | null): QueuedOp[] => readQueue().filter((o) => o.schoolId === schoolId && o.error);

export function discardOp(id: string): void {
  writeQueue(readQueue().filter((o) => o.id !== id));
}

/** Volta a pôr uma alteração recusada na fila de envio (por exemplo, depois da Direção reabrir a pauta). */
export function retryOp(id: string): void {
  writeQueue(readQueue().map((o) => (o.id === id ? { ...o, error: undefined } : o)));
}

/** Falha de rede (sem resposta do servidor): a alteração fica na fila e tenta-se mais tarde. */
export function isNetworkError(err: unknown): boolean {
  const e = err as { isAxiosError?: boolean; response?: unknown; code?: string } | null;
  return Boolean(e && e.isAxiosError && !e.response);
}

export interface FlushResult {
  sent: number;
  failed: number;
  pending: number;
}

let flushing = false;

/** Envia por ordem as alterações da escola; pára à primeira falha de rede, e marca com o motivo as que a API recusa. */
export async function flushQueue(schoolId: string, send: (op: QueuedOp) => Promise<void>, describe: (err: unknown) => string): Promise<FlushResult> {
  if (flushing) return { sent: 0, failed: 0, pending: pendingOps(schoolId).length };
  flushing = true;
  let sent = 0;
  let failed = 0;
  try {
    for (const op of pendingOps(schoolId)) {
      try {
        await send(op);
        discardOp(op.id);
        sent++;
      } catch (err) {
        if (isNetworkError(err)) break;
        failed++;
        writeQueue(readQueue().map((o) => (o.id === op.id ? { ...o, attempts: o.attempts + 1, error: describe(err) } : o)));
      }
    }
  } finally {
    flushing = false;
  }
  return { sent, failed, pending: pendingOps(schoolId).length };
}
