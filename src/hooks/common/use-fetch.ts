import api from "@/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook genérico para buscar dados da api
 * @param key Chave para o cache do React Query
 * @param endpoint URL do endpoint da api
 * @param options Opções adicionais do React Query
 */
export function useFetch<T>(key: string, endpoint: string, options = {}) {
  return useQuery<T>({
    queryKey: [key],
    queryFn: async (): Promise<T> => {
      const response = await api.get<T>(endpoint);
      return response.data;
    },
    ...options,
  });
}
