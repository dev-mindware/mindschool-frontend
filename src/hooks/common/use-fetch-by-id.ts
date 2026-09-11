import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook genérico para buscar dados pelo ID
 * @param key Chave única para cache no React Query
 * @param endpoint Rota da api (ex: "/api/users/")
 * @param id Identificador do recurso
 */
export function useFetchById<T>(key: string, endpoint: string, id: string) {
  return useQuery<T>({
    queryKey: [key, id], 
    queryFn: async (): Promise<T> => {
      if (!id) throw new Error("ID não fornecido");
      const response = await api.get<T>(`${endpoint}/${id}`);
      return response.data;
    },
    enabled: !!id, 
    staleTime: 1000 * 60 * 5, 
  });
}
