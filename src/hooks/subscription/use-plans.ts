import { Plan } from "@/types";
import { useFetch } from "../common/use-fetch";

export function usePlans() {
  const {
    data: plans,
    error,
    isLoading,
    refetch,
  } = useFetch<Plan[]>("plans", "/plans");
  return { plans: plans || [], error, isLoading, refetch };
}
