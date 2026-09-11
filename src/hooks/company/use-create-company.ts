import { companyService } from "@/services";
import { useModal } from "@/stores";
import { CompanyData } from "@/types/company";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddCompany() {
  const queryClient = useQueryClient();
  const { openModal } = useModal()

  return useMutation({
    mutationFn: (data: CompanyData) => companyService.addCompany(data),
    onSuccess: () => {
      openModal("account-created");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
