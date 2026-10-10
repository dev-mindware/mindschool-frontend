"use client";

import { useCallback, useMemo } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

/**
 * Filtros de listagem sincronizados com a URL (padrão MindGest: nuqs + shallow routing).
 * Cada lista usa um `prefix` próprio para que várias listas/abas não colidam nos parâmetros.
 * Mudar qualquer filtro repõe a página 1 (obrigatório). O valor vazio significa "sem filtro".
 */
export function useListFilters(prefix: string, filterKeys: readonly string[], defaultPageSize = 10) {
  const parsers = useMemo(() => {
    const p: Record<string, typeof parseAsString | typeof parseAsInteger> = {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
      sort: parseAsString.withDefault(""),
      order: parseAsString.withDefault("asc"),
    };
    for (const k of filterKeys) p[k] = parseAsString.withDefault("");
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKeys.join("|")]);

  const urlKeys = useMemo(() => Object.fromEntries(Object.keys(parsers).map((k) => [k, `${prefix}-${k}`])), [parsers, prefix]);
  const [state, setState] = useQueryStates(parsers, { urlKeys, history: "replace", shallow: true });

  const values = state as Record<string, string | number>;

  const setFilter = useCallback((key: string, value: string | null | undefined) => {
    void setState({ [key]: value ?? "", page: 1 });
  }, [setState]);

  const setSearch = useCallback((value: string) => void setState({ search: value, page: 1 }), [setState]);
  const setPage = useCallback((page: number) => void setState({ page }), [setState]);
  const setSort = useCallback((sort: string | null | undefined) => void setState({ sort: sort ?? "", page: 1 }), [setState]);
  const toggleOrder = useCallback(() => void setState({ order: values["order"] === "asc" ? "desc" : "asc" }), [setState, values]);

  const clear = useCallback(() => {
    const reset: Record<string, string | number | null> = { search: "", page: 1, sort: "", order: "asc" };
    for (const k of filterKeys) reset[k] = "";
    void setState(reset);
  }, [setState, filterKeys]);

  const activeCount = filterKeys.filter((k) => String(values[k] ?? "") !== "").length + (String(values["search"]) ? 1 : 0) + (String(values["sort"]) ? 1 : 0);

  return {
    values,
    search: String(values["search"] ?? ""),
    page: Number(values["page"] ?? 1),
    sort: String(values["sort"] ?? ""),
    order: String(values["order"] ?? "asc") as "asc" | "desc",
    pageSize: defaultPageSize,
    get: (key: string) => String(values[key] ?? ""),
    setFilter, setSearch, setPage, setSort, toggleOrder, clear, activeCount,
  };
}

export type ListFiltersState = ReturnType<typeof useListFilters>;
