import { companyService, type UpdateCompanyPayload } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyPayload }) =>
      companyService.updateCompany(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
