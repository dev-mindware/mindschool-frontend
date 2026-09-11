import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services";

export function useGetUser(id?: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await userService.getUserById(id);
      return response.data;
    },
    enabled: !!id,
  });
}
