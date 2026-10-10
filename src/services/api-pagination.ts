import api from "./api";

interface Page<T> {
  data: T[];
  page?: { limit: number; has_more: boolean; next_cursor: string | null };
}

/**
 * A API pagina por cursor (`page.next_cursor`). Para listas de gestao de dimensao escolar (centenas/poucos milhares)
 * le-se tudo, com tecto de seguranca, e a pagina visivel e feita no cliente.
 */
export async function fetchAllPages<T>(url: string, params: Record<string, unknown> = {}, cap = 2000): Promise<T[]> {
  const out: T[] = [];
  let cursor: string | null = null;
  do {
    const { data }: { data: Page<T> } = await api.get<Page<T>>(url, { params: { ...params, limit: 100, ...(cursor ? { cursor } : {}) } });
    out.push(...data.data);
    cursor = data.page?.has_more ? data.page.next_cursor : null;
  } while (cursor && out.length < cap);
  return out;
}
