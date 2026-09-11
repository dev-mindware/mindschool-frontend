import { useQuery } from "@tanstack/react-query";
import { agtService } from "@/services";

export function useAgtStatus(enabled = true) {
  return useQuery({
    queryKey: ["agt-status"],
    queryFn: () => agtService.getStatus(),
    enabled,
  });
}
