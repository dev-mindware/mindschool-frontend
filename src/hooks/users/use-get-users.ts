import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services";
import { User } from "@/types";

export function useGetUsers(params?: Record<string, any>) {
  return useQuery<User[]>({
    queryKey: ["users-list", params],
    queryFn: async () => {
      const response = await userService.getUsers({ limit: 100, ...params });
      return response.data?.data || [];
    },
  });
}
