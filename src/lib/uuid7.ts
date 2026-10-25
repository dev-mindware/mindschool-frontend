/**
 * Data de criação de um registo a partir do seu id: os ids da API são UUIDv7, cujos 48 bits iniciais são o instante
 * em milissegundos. Serve onde a API não devolve `created_at` (ex.: «Cadastrado em» do aluno).
 */
export function createdAtFromUuidV7(id: string | undefined | null): string {
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/i.test(id)) return "";
  const ms = parseInt(id.replace(/-/g, "").slice(0, 12), 16);
  return Number.isFinite(ms) ? new Date(ms).toISOString() : "";
}
